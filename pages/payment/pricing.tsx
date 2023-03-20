import { useState } from 'react';
import Spinner from '../../components/Spinner';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import * as z from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StripeCardElement, StripeCardElementChangeEvent, StripeError } from '@stripe/stripe-js';

const PricingPage = (): JSX.Element => {
  const [stripeError, setStripeError] = useState<string | undefined>(undefined);
  const [disabled, setDisabled] = useState(false);
  const [customerId, setCustomerId] = useState(undefined);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const formSchema = z.object({
    fullName: z.string().min(1, 'Full Name is Required'),
    email: z.string().email('Invalid Email').min(1, 'Email is Required'),
  });

  type FormSchemaType = z.infer<typeof formSchema>;

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormSchemaType> = (data) => {
    console.log(data);
  };

  function handleCardInputChange(event: StripeCardElementChangeEvent) {
    setDisabled(event?.empty);
    setStripeError(event?.error?.message ?? '');
  }

  async function handleCheckoutFormSubmit(event: any) {
    event.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet.
      return;
    }
    const inputValues = getValues();

    try {
      formSchema.parse(inputValues);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return;
      }
    }

    const createCustomer = await fetch('/api/stripe/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });

    const resp = await createCustomer.json();
    if (resp.code != 'customer_created') {
      return;
    }
    setCustomerId(resp.customer.id);

    // Call the subscribe endpoint and create a Stripe subscription
    // object. Returns the subscription ID and client secret
    const subscriptionResponse = await fetch('/api/stripe/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: resp.customer.id,
        priceId: 'price_1MmMbgA3gTSa41CeVKxjGTEx', //prod code
      }),
    });
    const subscription = await subscriptionResponse.json();
    
    const stripePayload = await stripe.confirmCardPayment(
      subscription.clientSecret, // returned by subscribe endpoint
      {
        payment_method: {
          card: elements.getElement(CardElement) as StripeCardElement,
        },
      }
    );

    if (stripePayload.error) {
      setStripeError(stripePayload.error.message);
    } else {
      setSuccess(true);
    }
  }

  const cardStyle = {
    style: {
      base: {
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '20px',
        '::placeholder': {
          color: '#32325d',
        },
      },
      invalid: {
        fontFamily: 'Arial, sans-serif',
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <>
      {success ? (
        <div className='flex flex-col w-full h-screen justify-center items-center'>
          <span className="w-1/3 h-min text-center text-2xl">
          Thank you for signing up for Hypno Pro. Credentials to log in to our
          platform should arrive in your inbox shortly.
          </span>
        </div>
      ) : (
        <div className='flex w-full h-screen gap-3 flex-row justify-center align-middle'>
          <div className='flex flex-col align-middle justify-center text-right w-1/3'>
            <span className='text-5xl'>Hypno Pro</span>
            <span className='text-2xl'>$99/mo</span>
          </div>
          <div className='form-control justify-center w-1/2 p-10 gap-5'>
            <input
              type='text'
              id='fullName'
              placeholder='Full Name'
              className='input w-full max-w-lg'
              {...register('fullName')}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.fullName && (
              <span className='text-red-800 block mt-2'>
                {errors.fullName?.message}
              </span>
            )}
            <input
              type='text'
              id='email'
              placeholder='Email'
              className='input w-full max-w-lg'
              {...register('email')}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <span className='text-red-800 block mt-2'>
                {errors.email?.message}
              </span>
            )}
            <form
              onSubmit={handleCheckoutFormSubmit}
              className='text-right form-control gap-5'
            >
              {/* <PaymentRequestButtonElement options={options} /> */}
              <CardElement
                options={cardStyle}
                onChange={handleCardInputChange}
                className="max-w-lg"
              />
              {stripeError && (
                <span className='text-red-800 block mt-2'>{stripeError}</span>
              )}
              <button
                className='btn btn-neutral rounded-md max-w-lg'
                disabled={!stripe && disabled}
                type='submit'
              >
                subscribe
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PricingPage;
