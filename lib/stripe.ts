
import { loadStripe } from '@stripe/stripe-js';

// This is your publishable key (safe to expose in client-side code)
const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export { stripePromise };

// Server-side Stripe instance (for API routes)
const secretKey = process.env.STRIPE_SECRET_KEY;
export const stripe = secretKey ? require('stripe')(secretKey) : null;
