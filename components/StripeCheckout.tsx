
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

interface StripeCheckoutProps {
  eventId: string;
  eventName: string;
  ticketId: string;
  userId: string;
  quantity: number;
  amount: number; // in dollars
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({ eventId, eventName, ticketId, userId, quantity, amount, onSuccess, onCancel }: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSheetReady, setPaymentSheetReady] = useState(false);
  
  // Use Stripe hooks at the top level
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    // Initialize payment sheet when component mounts
    initializePaymentSheet();
  }, []);

  const fetchPaymentSheetParams = async () => {
    try {
      console.log('📡 Fetching payment sheet params...');
      console.log('💰 Amount in dollars:', amount);
      console.log('💰 Amount in cents:', Math.round(amount * 100));

      // Create payment intent on our Express server
      const response = await fetch('http://10.0.0.41:3001/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents and ensure it's an integer
          eventId,
          eventName,
          ticketId,
          userId,
          quantity,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Payment intent creation failed:', response.status, errorText);
        
        let errorMessage = 'Failed to create payment intent';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            errorMessage += `: ${errorData.details}`;
          }
        } catch (e) {
          errorMessage += `: ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Payment intent response:', responseData);
      
      // Use the real values from the server
      return {
        paymentIntent: responseData.clientSecret,
        ephemeralKey: responseData.ephemeralKeySecret,
        customer: responseData.customerId,
      };

    } catch (error) {
      console.error('💥 Error fetching payment sheet params:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    if (Platform.OS === 'web') {
      // Web implementation - simulate payment sheet
      console.log('🌐 Using web payment simulation...');
      setPaymentSheetReady(true);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Initializing payment sheet...');

      const {
        paymentIntent,
        ephemeralKey,
        customer,
      } = await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({
        merchantDisplayName: "DysoV2 Events",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
        // methods that complete payment after a delay, like SEPA Debit and Sofort.
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'Event Attendee',
        }
      });

      if (error) {
        console.log('❌ Payment sheet initialization error:', error);
        Alert.alert('Error', error.message || 'Failed to initialize payment');
      } else {
        console.log('✅ Payment sheet initialized successfully');
        setPaymentSheetReady(true);
      }

    } catch (error) {
      console.error('💥 Error initializing payment sheet:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    if (Platform.OS === 'web') {
      // Web implementation - simulate payment
      console.log('🌐 Using web payment simulation...');
      
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Web payment simulation successful!');
      
      // Save purchase data directly for web simulation
      console.log('🔄 About to call savePurchaseDataLocally for web...');
      await savePurchaseDataLocally();
      console.log('✅ savePurchaseDataLocally for web completed');
      
      Alert.alert('Success', 'Payment completed successfully!', [
        {
          text: 'OK',
          onPress: onSuccess,
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('💳 Opening payment sheet...');

      const { error } = await presentPaymentSheet();

      if (error) {
        console.log('❌ Payment sheet error:', error);
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        console.log('✅ Payment successful!');
        
        // Save purchase data directly as fallback
        console.log('🔄 About to call savePurchaseDataLocally...');
        console.log('📋 Payment success data:', {
          ticketId,
          userId,
          eventId,
          eventName,
          quantity,
          amount
        });
        await savePurchaseDataLocally();
        console.log('✅ savePurchaseDataLocally completed');
        
        Alert.alert('Success', 'Your payment is confirmed!', [
          {
            text: 'OK',
            onPress: onSuccess,
          },
        ]);
      }

    } catch (error) {
      console.error('💥 Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback function to save purchase data directly
  const savePurchaseDataLocally = async () => {
    try {
      console.log('🎯 FALLBACK FUNCTION CALLED!');
      console.log('💾 Starting fallback save process...');
      console.log('📋 Data to save:', {
        ticketId,
        userId,
        eventId,
        eventName,
        quantity,
        amount,
        paymentMethod: Platform.OS === 'web' ? 'web_simulation' : 'stripe_mobile'
      });
      
      // Import supabase client
      const { supabase } = await import('@/lib/supabase');
      
      // Generate a unique QR code for the ticket
      const qrCode = `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert into ticket_purchases table directly
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
          stripe_payment_intent_id: `fallback_${Date.now()}_${Platform.OS === 'web' ? 'web_simulation' : 'stripe_mobile'}`,
        })
        .select();

      if (purchaseError) {
        console.error('❌ Error saving ticket purchase:', purchaseError);
        throw new Error(`Failed to save ticket purchase: ${purchaseError.message}`);
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
      
      console.log('✅ Purchase data saved successfully via client-side fallback');
      
    } catch (error) {
      console.error('💥 Error in savePurchaseDataLocally:', error);
      console.error('💥 Error details:', JSON.stringify(error, null, 2));
      // Don't show error to user as payment was successful
    }
  };

  if (isLoading && !paymentSheetReady) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B61FF" />
          <Text style={styles.loadingText}>Preparing payment...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.paymentInfo}>
        <Text style={styles.eventName}>{eventName}</Text>
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <Text style={styles.description}>
          {Platform.OS === 'web' 
            ? 'Tap the payment button below to process your payment securely.'
            : 'Tap the payment button below to securely enter your payment information using Stripe\'s secure payment form.'
          }
        </Text>
        {Platform.OS === 'web' && (
          <Text style={styles.webNote}>
            Note: This is a web simulation. For real payments, test on iOS or Android.
          </Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.payButton]} 
          onPress={openPaymentSheet}
          disabled={isLoading || !paymentSheetReady}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>Pay ${amount.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: '80%',
    width: '90%',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  paymentInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7B61FF',
  },
  formContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    textAlign: 'center',
  },
  webNote: {
    fontSize: 12,
    color: '#FF6B35',
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  payButton: {
    backgroundColor: '#7B61FF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
