import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import Stripe from 'stripe';

const createSubscription = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}` as string, {
      apiVersion: '2022-11-15',
    });
    const { customerId, priceId } = req.body;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      metadata: {
        // You can save details about your user here
        // Or any other metadata that you would want as reference.
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // Optional but recommended
    // Save the subscription object or ID to your database

    // Send the subscription ID and a client secret that the
    // Stripe subscription API creates. The subscription ID
    // and client secret will be used to
    // complete the payment on the frontend later.
    if (subscription && subscription.latest_invoice) {
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      if (invoice.payment_intent) {
        const intent = invoice.payment_intent as Stripe.PaymentIntent;
        res.status(200).json({
          code: 'subscription_created',
          subscriptionId: subscription.id,
          clientSecret: intent.client_secret,
        });
      }
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({
      code: 'subscription_creation_failed',
      error: e,
    });
  }
};

const cancelSubscription = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}` as string, {
      apiVersion: '2022-11-15',
    });
    const { subscriptionId } = req.body;

    const deletedSubscription = await stripe.subscriptions.del(subscriptionId);

    res.status(200).json({
      code: 'subscription_deleted',
      deletedSubscription,
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({
      code: 'subscription_deletion_failed',
      error: e,
    });
  }
};

const handler = nc({ attachParams: true })
  .post(createSubscription)
  .delete(cancelSubscription);

export default handler;
