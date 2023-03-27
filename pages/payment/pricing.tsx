import { useState } from 'react';
import Spinner from '../../components/Spinner';
import {
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import * as z from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  StripeCardElement,
  StripeCardElementChangeEvent,
  StripeCardNumberElement,
  StripeError,
} from '@stripe/stripe-js';
import ArrowRight from '../../public/pop/arrow-right.svg';

const PricingPage = (): JSX.Element => {
  const [stripeError, setStripeError] = useState<string | undefined>(undefined);
  const [disabled, setDisabled] = useState(false);
  const [customerId, setCustomerId] = useState(undefined);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [zip, setZip] = useState('');
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
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
    setProcessing(true);
    event.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet.
      setProcessing(false);
      return;
    }
    const inputValues = getValues();

    try {
      formSchema.parse(inputValues);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setProcessing(false);
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
      setProcessing(false);
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
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID, //prod code
      }),
    });
    const subscription = await subscriptionResponse.json();

    const stripePayload = await stripe.confirmCardPayment(
      subscription.clientSecret, // returned by subscribe endpoint
      // {
      //   payment_method: {
      //     card: elements.getElement(CardElement) as StripeCardElement,
      //   },
      // }
      {
        payment_method: {
          card: elements.getElement(
            CardNumberElement
          ) as StripeCardNumberElement,
        },
      }
    );

    if (stripePayload.error) {
      setStripeError(stripePayload.error.message);
      setProcessing(false);
    } else {
      setProcessing(false);
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

  const inputStyle = {
    color: '#00FF99',
    background: 'transparent',
    fontFamily: 'inherit',
    ':-webkit-autofill': {
      color: '#99F8AA',
    },
    '::placeholder': {
      color: '#999999',
      fontSize: '20px',
      fontWeight: '400',
    },
  };

  return (
    <>
      {success ? (
        <div className='flex flex-col w-full h-screen justify-center items-center'>
          <span className='text-6xl font-thin mb-8 text-center text-[#FFFFFF]'>success.</span>
          <span className='md:w-1/3 h-min text-center font-thin text-lg text-[#FFFFFF]'>
            thanks for your payment. check your email for directions to create
            your hypno account and activate your membership.
          </span>
        </div>
      ) : (
        <div className='flex flex-col justify-items-center justify-center items-center w-full h-screen gap-3 p-8'>
          <span className='text-6xl font-thin mb-8 text-center text-[#FFFFFF]'>payment.</span>
          <div className='form-control w-full md:w-2/5 gap-2'>
            <input
              type='text'
              id='email'
              placeholder='email'
              autoComplete='off'
              className='w-full outline-none bg-transparent border-b border-b-[#333333] placeholder-[#999999] text-[#00FF99] placeholder:text-xl p-4'
              {...register('email')}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <span className='text-red-800 block mt-2'>
                {errors.email?.message}
              </span>
            )}
            <input
              type='text'
              id='fullName'
              placeholder='name'
              autoComplete='off'
              className='w-full outline-none bg-transparent border-b border-b-[#333333] placeholder-[#999999] text-[#00FF99] placeholder:text-xl p-4'
              {...register('fullName')}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.fullName && (
              <span className='text-red-800 block mt-2'>
                {errors.fullName?.message}
              </span>
            )}
            <form
              onSubmit={handleCheckoutFormSubmit}
              className='form-control justify-center items-center gap-2'
            >
              {/* <PaymentRequestButtonElement options={options} /> */}
              <CardNumberElement
                options={{
                  style: {
                    base: inputStyle,
                  },
                  placeholder: 'card number',
                }}
                className='w-full outline-none bg-transparent border-b border-b-[#333333] p-4'
              />
              <CardExpiryElement
                options={{
                  style: {
                    base: inputStyle,
                  },
                  placeholder: 'expiration',
                }}
                className='w-full outline-none bg-transparent border-b border-b-[#333333] p-4'
              />
              <CardCvcElement
                options={{
                  style: {
                    base: inputStyle,
                  },
                  placeholder: 'security',
                }}
                className='w-full outline-none bg-transparent border-b border-b-[#333333] p-4'
              />
              {/* <CardElement
                options={cardStyle}
                onChange={handleCardInputChange}
                className='md:max-w-lg'
              /> */}
              {stripeError && (
                <span className='text-red-800 block mt-2'>{stripeError}</span>
              )}
              <input
                type='text'
                id='zip'
                placeholder='zip/postal'
              className='w-full outline-none bg-transparent border-b border-b-[#333333] placeholder-[#999999] text-[#00FF99] placeholder:text-xl p-4'
                onChange={(e) => setZip(e.target.value)}
                pattern='^([0-9]{5})$'
                autoComplete='off'
                maxLength={5}
              />
              {/* {errors.email && (
                <span className='text-red-800 block mt-2'>
                  {errors.email?.message}
                </span>
              )} */}
              <span className="text-sm text-center mt-3 text-[#333333]">
                you will be charged $99 USD monthly (plus tax) for your
                membership. once payment is confirmed, you will receive
                instructions via email to create your account and activate your
                membership. use of the hypno system is subject to our terms and
                privacy policy. thanks for being part of hypno.
              </span>
              <button
                className='btn btn-neutral rounded-full font-sans lowercase text-lg pl-8 pr-8 mt-8'
                disabled={!stripe && disabled}
                type='submit'
              >
                {processing ? <Spinner /> : 'submit'}
                {!processing && <ArrowRight />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PricingPage;
