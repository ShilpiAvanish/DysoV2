
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { stripePromise } from '@/lib/stripe';

interface StripeCheckoutProps {
  eventId: string;
  eventName: string;
  amount: number; // in dollars
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({ eventId, eventName, amount, onSuccess, onCancel }: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateCard = () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return false;
    }
    
    if (expiryDate.length !== 5) {
      Alert.alert('Invalid Expiry', 'Please enter expiry date in MM/YY format');
      return false;
    }
    
    if (cvc.length < 3 || cvc.length > 4) {
      Alert.alert('Invalid CVC', 'Please enter a valid CVC code');
      return false;
    }
    
    if (!cardholderName.trim()) {
      Alert.alert('Missing Name', 'Please enter the cardholder name');
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    console.log('💳 Payment button clicked');
    
    if (!validateCard()) {
      console.log('❌ Card validation failed');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Starting payment process...');
      
      // Check if Stripe is configured
      if (!stripePromise) {
        console.log('❌ Stripe not configured');
        Alert.alert('Configuration Error', 'Stripe is not properly configured. Please contact support.');
        setIsLoading(false);
        return;
      }
      
      console.log('📡 Creating payment intent...');
      // Create payment intent on server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          eventId,
          eventName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Payment intent creation failed:', response.status, errorText);
        throw new Error(`Failed to create payment intent: ${response.status} ${errorText}`);
      }

      const { clientSecret } = await response.json();
      console.log('✅ Payment intent created, client secret received');

      if (!clientSecret) {
        console.log('❌ No client secret in response');
        throw new Error('Failed to create payment intent - no client secret');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Parse expiry date
      const [month, year] = expiryDate.split('/');
      
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(month),
          exp_year: parseInt(`20${year}`),
          cvc: cvc,
        },
        billing_details: {
          name: cardholderName,
        },
      });

      if (paymentMethodError) {
        Alert.alert('Payment Error', paymentMethodError.message || 'Invalid payment details');
        setIsLoading(false);
        return;
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (confirmError) {
        Alert.alert('Payment Failed', confirmError.message || 'Payment could not be processed');
        setIsLoading(false);
        return;
      }

      // Payment successful
      Alert.alert('Success', 'Payment completed successfully!', [
        {
          text: 'OK',
          onPress: onSuccess,
        },
      ]);

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        <View style={styles.paymentInfo}>
          <Text style={styles.eventName}>{eventName}</Text>
          <Text style={styles.amount}>${amount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cardholder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={cardholderName}
            onChangeText={setCardholderName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>CVC</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              value={cvc}
              onChangeText={setCvc}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>
        </View>
      </ScrollView>
      
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
          onPress={handlePayment}
          disabled={isLoading}
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
  scrollContainer: {
    flex: 1,
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1B1F',
    backgroundColor: '#FAFAFA',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
