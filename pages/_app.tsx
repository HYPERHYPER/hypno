import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Analytics } from '@vercel/analytics/react';

const stripePromise = loadStripe(
  `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}` as string
);

export default function App({ Component, pageProps }: AppProps) {
  return (
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
        <Analytics />
      </Elements>
  );
}
