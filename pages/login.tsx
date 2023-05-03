import { Footer } from '@/components/Footer'
import Head from 'next/head'
import Image from 'next/image'
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import FormControl from '@/components/Form/FormControl';


export default withAuth(LoginPage, 'auth');
function LoginPage() {
    const login = useUserStore.useLogin();
    const user = useUserStore.useUser();
    const error = useUserStore.useError();

    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const submitLogin = (data: any) => {
        setIsLoggingIn(true)
        if (!_.isEmpty(errors)) {
            setIsLoggingIn(false);
            console.log("submitLogin errors", { errors });
            return;
        }

        console.log("submitLogin", { data });
        login(data.email, data.password);
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
            <GlobalLayout>
                <main className='fixed inset-0 bg-black w-screen min-h-screen'>
                    <div className='hero min-h-screen'>
                        <div className='hero-content sm:max-w-2xl w-full flex-col items-start space-y-9'>
                            <div className='space-y-3'>
                            <h1 className='text-white'>login</h1>
                            <div><Link href='/signup' className='text-primary hover:underline transition text-3xl'>don&apos;t have an account yet?</Link></div>
                            </div>
                            <form className='flex flex-col w-full border-t-2 border-white/20' onSubmit={handleSubmit(submitLogin)}>
                                <FormControl label='email'>
                                    <input
                                        className={`input pro ${errors['email'] && 'error text-red-600'}`}
                                        placeholder={`${errors['email'] ? (errors['email']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('email', {
                                            required: true,
                                            pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                                        })}
                                    />
                                </FormControl>

                                <FormControl label='password'>
                                    <input
                                        className={`input pro ${errors['password'] && 'error text-red-600'}`}
                                        placeholder={`${errors['password'] ? (errors['password']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        type='password'
                                        {...register('password', {
                                            required: true,
                                        })}
                                    />
                                </FormControl>

                                <input type='submit' value='ok' className='btn btn-primary rounded-lg mt-10 text-4xl h-[80px]' />
                            </form>
                            
                            {error && (
                                <div className="alert alert-error justify-center mt-3">
                                    <div className='font-medium'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>oops! {error.toLowerCase()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <Footer />
                </main>
            </GlobalLayout>
        </>
    )
}
