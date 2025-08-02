const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = 'https://mqdpyulsjupdxtmysyvg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZHB5dWxzanVwZHh0bXlzeXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTY0ODksImV4cCI6MjA2OTEzMjQ4OX0.PctpWMbce2ir2-swOvVFkFp-92lL1mfiyryeWWS785w';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simple server is running' });
});

// Mock payment intent endpoint (for testing)
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, eventId, eventName, ticketId, userId, quantity } = req.body;

    console.log('💰 Mock payment intent request:', { amount, eventId, eventName, ticketId, userId, quantity });

    // Return mock data
    res.json({
      clientSecret: 'mock_client_secret',
      paymentIntentId: 'mock_payment_intent',
      customerId: 'mock_customer',
      ephemeralKeySecret: 'mock_ephemeral_key',
    });

  } catch (error) {
    console.error('❌ Error in mock payment intent:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: error.message
    });
  }
});

// Save purchase endpoint
app.post('/api/save-purchase', async (req, res) => {
  try {
    const { ticketId, userId, eventId, eventName, quantity, amount, paymentMethod } = req.body;

    console.log('💾 Saving purchase data:', {
      ticketId,
      userId,
      eventId,
      eventName,
      quantity,
      amount,
      paymentMethod
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
        total_amount: parseFloat(amount),
        purchase_date: new Date().toISOString(),
        qr_code: qrCode,
        status: 'active', // Changed from 'completed' to 'active'
        stripe_payment_intent_id: `mock_${Date.now()}_${paymentMethod}`,
      })
      .select();

    if (purchaseError) {
      console.error('❌ Error saving ticket purchase:', purchaseError);
      return res.status(500).json({
        error: 'Failed to save ticket purchase',
        details: purchaseError.message
      });
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
    } else {
      console.log('✅ Event attendee record created successfully');
    }

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Payment endpoint: http://localhost:${PORT}/api/create-payment-intent`);
  console.log(`💾 Save endpoint: http://localhost:${PORT}/api/save-purchase`);
}); 