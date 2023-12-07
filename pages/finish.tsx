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
import { useRouter } from 'next/router';

export default withAuth(CompleteProRegistrationPage, 'optional');
function CompleteProRegistrationPage() {
    const loggedInUser = useUserStore.useUser();
    const finishProSignup = useUserStore.useFinishProSignup();
    const error = useUserStore.useError();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            first_name: loggedInUser?.first_name || '',
            last_name: loggedInUser?.last_name || '',
            username: loggedInUser?.username || '',
        }
    });

    const submitForm = async (data: any) => {
        setIsLoading(true);
        console.log("submitCompleteProRegistration", { data });
        const { first_name, last_name, username } = data;
        finishProSignup(first_name, last_name, username);
        setIsLoading(false);
    }

    const handleErrors = (data: any) => {
        if (!_.isEmpty(errors)) {
            setIsLoading(false);
            console.log("submitCompleteProRegistration errors", { errors });
            return;
        }
    }

    return (
        <>
            <Head>
                <title>complete pro registration | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <main className='absolute inset-0 bg-black w-screen min-h-screen sm:mt-[150px]'>
                    <div className='hero min-h-screen sm:min-h-full'>
                        <div className='hero-content sm:max-w-3xl w-full text-left flex-col items-start space-y-9'>
                            <div className='space-y-3'>
                                <h1 className='text-white'>finish pro signup</h1>
                                <h2 className='text-3xl text-primary'>please input the following information to continue</h2>
                            </div>
                            <form className='flex flex-col w-full border-t-2 border-white/20' onSubmit={handleSubmit(submitForm, handleErrors)}>
                                <FormControl label='email'>
                                    <input
                                        disabled={true}
                                        value={loggedInUser?.email}
                                        className={`input pro opacity-40 `}
                                    />
                                </FormControl>
                                <FormControl label='first name'>
                                    <input
                                        className={`input pro ${errors['first_name'] && 'error text-red-600'}`}
                                        placeholder={`${errors['first_name'] ? (errors['first_name']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('first_name', {
                                            required: true,
                                        })}
                                    />
                                </FormControl>

                                <FormControl label='last name'>
                                    <input
                                        className={`input pro ${errors['last_name'] && 'error text-red-600'}`}
                                        placeholder={`${errors['last_name'] ? (errors['last_name']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('last_name', {
                                            required: true,
                                        })}
                                    />
                                </FormControl>

                                <FormControl label='username'>
                                    <input
                                        className={`input pro ${errors['username'] && 'error text-red-600'}`}
                                        placeholder={`${errors['username'] ? (errors['username']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('username', {
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
