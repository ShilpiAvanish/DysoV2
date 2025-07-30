
import { loadStripe } from '@stripe/stripe-js';

// This is your publishable key (safe to expose in client-side code)
const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export { stripePromise };

// Server-side Stripe instance (for API routes)
export const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
