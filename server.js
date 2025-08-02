const express = require('express');
const cors = require('cors');
const stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Stripe with your secret key
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabaseUrl = 'https://mqdpyulsjupdxtmysyvg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZHB5dWxzanVwZHh0bXlzeXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTY0ODksImV4cCI6MjA2OTEzMjQ4OX0.PctpWMbce2ir2-swOvVFkFp-92lL1mfiyryeWWS785w';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Stripe server is running' });
});

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, eventId, eventName, ticketId, userId, quantity } = req.body;

    console.log('💰 Creating payment intent:', { amount, eventId, eventName, ticketId, userId, quantity });

    // Validate required fields
    if (!amount || !eventId || !eventName || !ticketId || !userId || !quantity) {
      return res.status(400).json({
        error: 'Missing required fields: amount, eventId, eventName, ticketId, userId, quantity'
      });
    }

    // Create or retrieve a customer
    // In a real app, you'd look up the customer by user ID
    const customer = await stripeInstance.customers.create({
      metadata: {
        eventId,
        eventName,
        ticketId,
        userId,
        quantity: quantity.toString(),
      },
    });

    console.log('👤 Customer created:', customer.id);

    // Create an ephemeral key for the customer
    const ephemeralKey = await stripeInstance.ephemeralKeys.create(
      {
        customer: customer.id,
      },
      {
        apiVersion: '2023-10-16', // Use the latest API version
      }
    );

    console.log('🔑 Ephemeral key created:', ephemeralKey.id);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount), // Ensure amount is in cents and is an integer
      currency: 'usd',
      customer: customer.id,
      metadata: {
        eventId,
        eventName,
        ticketId,
        userId,
        quantity: quantity.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customer.id,
      ephemeralKeySecret: ephemeralKey.secret,
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: error.message
    });
  }
});

// Webhook endpoint to handle payment success
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Payment succeeded:', paymentIntent.id);
      
      // Save ticket purchase to database
      await saveTicketPurchase(paymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Payment failed:', failedPayment.id);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Fallback endpoint to save purchase data directly
app.post('/api/save-purchase', async (req, res) => {
  try {
    const { ticketId, userId, eventId, eventName, quantity, amount, paymentMethod } = req.body;

    console.log('💾 Saving purchase data via fallback endpoint:', {
      ticketId,
      userId,
      eventId,
      eventName,
      quantity,
      amount,
      paymentMethod
    });

    // Validate required fields
    if (!ticketId || !userId || !eventId || !eventName || !quantity || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: ticketId, userId, eventId, eventName, quantity, amount'
      });
    }

    // Generate a unique QR code for the ticket
    const qrCode = `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert into ticket_purchases table
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('ticket_purchases')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        quantity: parseInt(quantity),
        total_amount: parseFloat(amount),
        purchase_date: new Date().toISOString(),
        qr_code: qrCode,
        status: 'completed',
        stripe_payment_intent_id: `fallback_${Date.now()}_${paymentMethod}`,
      })
      .select();

    if (purchaseError) {
      console.error('❌ Error saving ticket purchase:', purchaseError);
      return res.status(500).json({
        error: 'Failed to save ticket purchase',
        details: purchaseError.message
      });
    }

    console.log('✅ Ticket purchase saved successfully via fallback:', purchaseData[0]);
    
    // Also create record in event_attendees table
    const { error: attendeeError } = await supabase
      .from('event_attendees')
      .upsert({
        event_id: eventId,
        user_id: userId,
        attendance_type: 'ticket',
        status: 'approved',
        ticket_id: ticketId
      }, {
        onConflict: 'event_id,user_id'
      });

    if (attendeeError) {
      console.error('⚠️ Error creating event attendee record:', attendeeError);
    } else {
      console.log('✅ Event attendee record created successfully');
    }
    
    // Update ticket capacity
    await updateTicketCapacity(ticketId, parseInt(quantity));

    res.json({
      success: true,
      purchaseId: purchaseData[0].id,
      message: 'Purchase saved successfully'
    });

  } catch (error) {
    console.error('💥 Error in save-purchase endpoint:', error);
    res.status(500).json({
      error: 'Failed to save purchase',
      details: error.message
    });
  }
});

// Function to save ticket purchase to Supabase
async function saveTicketPurchase(paymentIntent) {
  try {
    const { eventId, eventName, ticketId, userId, quantity } = paymentIntent.metadata;
    
    console.log('💾 Saving ticket purchase to database:', {
      ticketId,
      userId,
      quantity,
      totalAmount: paymentIntent.amount / 100, // Convert from cents to dollars
    });

    // Generate a unique QR code for the ticket
    const qrCode = `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert into ticket_purchases table
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('ticket_purchases')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        quantity: parseInt(quantity),
        total_amount: paymentIntent.amount / 100, // Convert from cents to dollars
        purchase_date: new Date().toISOString(),
        qr_code: qrCode,
        status: 'active', // Changed from 'completed' to 'active'
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select();

    if (purchaseError) {
      console.error('❌ Error saving ticket purchase:', purchaseError);
      throw purchaseError;
    }

    console.log('✅ Ticket purchase saved successfully:', purchaseData[0]);
    
    // Also create record in event_attendees table
    const { error: attendeeError } = await supabase
      .from('event_attendees')
      .upsert({
        event_id: eventId,
        user_id: userId,
        attendance_type: 'ticket',
        status: 'approved',
        ticket_id: ticketId
      }, {
        onConflict: 'event_id,user_id'
      });

    if (attendeeError) {
      console.error('⚠️ Error creating event attendee record:', attendeeError);
      // Don't throw error here as the purchase was successful
    } else {
      console.log('✅ Event attendee record created successfully');
    }
    
    // Update ticket capacity
    await updateTicketCapacity(ticketId, parseInt(quantity));
    
    return purchaseData[0];
  } catch (error) {
    console.error('💥 Error in saveTicketPurchase:', error);
    throw error;
  }
}

// Function to update ticket capacity after purchase
async function updateTicketCapacity(ticketId, purchasedQuantity) {
  try {
    // Get current ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('capacity, sold_count')
      .eq('id', ticketId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching ticket:', fetchError);
      return;
    }

    // Update sold count
    const newSoldCount = (ticket.sold_count || 0) + purchasedQuantity;
    
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ sold_count: newSoldCount })
      .eq('id', ticketId);

    if (updateError) {
      console.error('❌ Error updating ticket capacity:', updateError);
    } else {
      console.log('✅ Ticket capacity updated:', { ticketId, newSoldCount });
    }
  } catch (error) {
    console.error('💥 Error updating ticket capacity:', error);
  }
}

// Get payment intent status
app.get('/api/payment-intent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(id);
    res.json(paymentIntent);
  } catch (error) {
    console.error('❌ Error retrieving payment intent:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment intent',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Stripe server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Payment endpoint: http://localhost:${PORT}/api/create-payment-intent`);
  console.log(`🔔 Webhook endpoint: http://localhost:${PORT}/api/webhook`);
}); 