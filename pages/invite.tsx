import { Footer } from '@/components/Footer'
import Head from 'next/head'
import Image from 'next/image'
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import withAuth from '@/components/hoc/withAuth';

export default withAuth(AcceptInvitePage, 'auth');
function AcceptInvitePage() {
    const { query } = useRouter();
    const organization = 'hypno'
    const role = 'admin'
    const inviter = 'sydney'

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();
    const formData = watch();

    const submitAccept = async (data: any) => {
        setIsLoading(true)
        const passwordConfirmed = formData.password === formData.confirm_password;
        if (!_.isEmpty(errors) || !passwordConfirmed) {
            setIsLoading(false);
            console.log("submitResetPassword errors", { errors });
            if (!passwordConfirmed) {
                setError('your passwords do not match.')
            }
            return;
        }

        setError('');

        console.log("submitResetPassword", { data });

        setIsLoading(false);
        setSuccess(true);
    }

    return (
        <>
            <Head>
                <title>{`join ${organization || 'hypno'}  | hypno™`}</title>
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
                    <div className='hero-content px-6 sm:max-w-xl w-full flex-col'>
                        <h1 className='text-white text-3xl sm:text-5xl text-center'>{success ? 'welcome.' : `join ${organization}.`}</h1>
                        <p className='text-white/40 text-xl'>you're invited to join {inviter}'s organization on hypno.</p>
                        <p className='text-white/40 text-xl'>as a {role}, you can invite other users to join and are granted data access.</p>
                        {!success ? (
                            <>
                                <form className='flex flex-col gap-4 w-full my-4' onSubmit={handleSubmit(submitAccept)}>
                                    <input
                                        className={`input sm:input-lg ${errors['first_name'] && 'error text-red-600'}`}
                                        placeholder={`first name${errors['first_name'] ? (errors['first_name']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('first_name', {
                                            required: true,
                                        })}
                                    />
                                    <input
                                        className={`input sm:input-lg ${errors['last_name'] && 'error text-red-600'}`}
                                        placeholder={`last name${errors['last_name'] ? (errors['last_name']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('last_name', {
                                            required: true,
                                        })}
                                    />
                                    <input
                                        className={`input sm:input-lg ${errors['username'] && 'error text-red-600'}`}
                                        placeholder={`username${errors['username'] ? (errors['username']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('username', {
                                            required: true,
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
                                    <input
                                        className={`input sm:input-lg ${errors['confirm_password'] && 'error text-red-600'}`}
                                        placeholder={`confirm password${errors['confirm_password'] ? (errors['confirm_password']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        type='password'
                                        {...register('confirm_password', {
                                            required: true,
                                        })}
                                    />
                                    <input type='submit' value='submit' className='btn btn-gallery sm:btn-lg btn-primary rounded-full mt-3' />
                                </form>
                                {error && (
                                    <div className="alert alert-error justify-center mt-3">
                                        <div className='font-medium'>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span>oops! {error.toLowerCase()}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className='text-white/50 w-full space-y-10'>
                                <p className='text-xl'>you're all set, {formData.user?.first_name}! <br />you can now login to view {organization}'s events.</p>
                                <Link href='/login' className='w-full btn btn-gallery sm:btn-lg btn-primary rounded-full'>continue to login →</Link>
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </main>
        </>
    )
}
