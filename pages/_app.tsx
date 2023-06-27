import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Analytics } from '@vercel/analytics/react';
import ReactGA from 'react-ga';
import { useEffect } from 'react';
const TRACKING_ID = "AW-860626681"; // OUR_TRACKING_ID
ReactGA.initialize(TRACKING_ID);

const stripePromise = loadStripe(
  `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}` as string
);

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);
  
  return (
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
        <Analytics />
      </Elements>
  );
}
