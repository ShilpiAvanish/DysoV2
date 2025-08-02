
import { initStripe } from '@stripe/stripe-react-native';

// Initialize Stripe with your publishable key
export const initializeStripe = async () => {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.warn('⚠️ EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe payments will not work.');
    return false;
  }

  try {
    await initStripe({
      publishableKey,
      merchantIdentifier: 'merchant.com.yourcompany.yourapp', // Optional: for Apple Pay
    });
    console.log('✅ Stripe initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error);
    return false;
  }
};

// Note: Server-side Stripe instance should only be used in server.js, not in React Native app
// The server-side code is in server.js file
