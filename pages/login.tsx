import { Footer } from '@/components/Footer'
import Head from 'next/head'
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import FormControl from '@/components/Form/FormControl';
import clsx from 'clsx';
import { ThreeDots } from 'react-loader-spinner';


export default withAuth(LoginPage, 'auth');
function LoginPage() {
    const login = useUserStore.useLogin();
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
    }

    useEffect(() => {
        setIsLoggingIn(false);
    }, [error]);

    return (
        <>
            <Head>
                <title>login | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <main className='absolute inset-0 bg-black w-screen min-h-screen'>
                    <div className='hero min-h-screen'>
                        <div className='hero-content sm:max-w-2xl w-full flex-col items-start space-y-9'>
                            <div className='space-y-3'>
                                <h1 className='text-white'>login</h1>
                                <h2><Link href='/signup' className='text-primary hover:underline transition'>don&apos;t have an account yet?</Link></h2>
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

                                <Link href={'/password-reset'} className='text-right text-white/40 mt-4 hover:underline transition'><h2>forgot password?</h2></Link>
                                
                                <input type='submit' value='ok' className={clsx('btn btn-primary rounded-[10px] sm:rounded-lg mt-10 text-base sm:text-4xl h-[20px] sm:h-[80px]', isLoggingIn && 'hidden')} />
                                {isLoggingIn && <button disabled className='btn btn-primary rounded-[10px] sm:rounded-lg mt-10 text-4xl h-[20px] sm:h-[80px]'>
                                    <ThreeDots
                                        height="20"
                                        width="50"
                                        radius="4"
                                        color="#FFF"
                                        ariaLabel="three-dots-loading"
                                        visible={true}
                                    />
                                </button>}

                            </form>

                            {(error || errors['email']?.type == 'pattern') && (
                                <div className="alert alert-error justify-center mt-3 font-medium gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>oops! {error.toLowerCase() || 'must be a valid email'}</span>
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
