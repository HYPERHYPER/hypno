import { Footer } from '@/components/Footer'
import Head from 'next/head'
import Image from 'next/image'
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    
    const submitLogin = async (data: any) => {
        setIsLoggingIn(true)
        if (!_.isEmpty(errors)) {
            setIsLoggingIn(false);
            console.log("submitLogin errors", { errors });
            return;
        }

        console.log("submitLogin", { data });
        // const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`;
        // const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
        // const payload = { email: data.email, password: data.password };
        // let resp = await axios.put(url, payload, {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         Authorization: 'Bearer ' + token,
        //     },
        // });

        setIsLoggingIn(false);
    }

    return (
        <>
            <Head>
                <title>login | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className='fixed inset-0 bg-black w-screen min-h-screen'>
                <div className='absolute top-0 bottom-0 left-0 right-0 w-full'>
                    <div className='flex justify-center'>
                        <Image className='max-h-[22vw] max-w-[33vw] w-auto py-[25px]' src={'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={"hypno™ logo"} width={150} height={25} priority />
                    </div>
                </div>
                <div className='hero min-h-screen'>
                    <div className='hero-content px-6 sm:max-w-xl w-full text-center flex-col'>
                        <h1 className='text-white text-3xl sm:text-5xl'>login.</h1>
                        <form className='flex flex-col gap-4 w-full my-4' onSubmit={handleSubmit(submitLogin)}>
                            <input
                                className={`input sm:input-lg ${errors['email'] && 'error text-red-600'}`}
                                placeholder={`email${errors['email'] ? (errors['email']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                {...register('email', {
                                    required: true,
                                    pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/ ,
                                })}
                            />
                            <input
                                className={`input sm:input-lg ${errors['password'] && 'error text-red-600'}`}
                                placeholder={`password${errors['password'] ? (errors['password']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                type='password'
                                {...register('password', {
                                    required: true,
                                })}
                            />
                            <input type='submit' value='continue →' className='btn btn-gallery sm:btn-lg btn-primary rounded-full mt-3' />
                        </form>
                        <Link href='/signup' className='text-white/30 hover:text-white transition-colors text-lg'>don't have an account yet? sign up.</Link>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    )
}
