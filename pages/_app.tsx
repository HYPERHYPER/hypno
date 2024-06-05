import "@/styles/globals.css";
import type { AppProps } from "next/app";
// import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from "@stripe/stripe-js";
import { Analytics } from "@vercel/analytics/react";
// import ReactGA from 'react-ga';
// import { useEffecti } from 'react';
import Script from "next/script";
const TRACKING_ID = "G-93Y5N61TVT"; // OUR_TRACKING_ID
// ReactGA.initialize(TRACKING_ID);
import "../components/DataCapture/DatePicker.css";

// const stripePromise = loadStripe(
//   `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}` as string,
// );

export default function App({ Component, pageProps }: AppProps) {
  // useEffect(() => {
  //   ReactGA.pageview(window.location.pathname + window.location.search);
  // }, []);

  return (
    // <Elements stripe={stripePromise}>
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-93Y5N61TVT"
      />
      <Script id="google-tag" onLoad={() => console.log("Gtag script loaded")}>
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-93Y5N61TVT');`}
      </Script>
      <Component {...pageProps} />
      <Analytics />
    </>
    // </Elements>i
  );
}
