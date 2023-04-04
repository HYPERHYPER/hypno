import { Footer } from '@/components/Footer'
import Head from 'next/head'
import Image from 'next/image'
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const submitSignup = async (data: any) => {
        setIsLoading(true)
        if (!_.isEmpty(errors)) {
            setIsLoading(false);
            console.log("submitSignup errors", { errors });
            return;
        }

        console.log("submitSignup", { data });
        // const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/`;
        // const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
        const payload = { ...data, user: { ...data.user, role: 0 } };
        // let resp = await axios.put(url, payload, {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         Authorization: 'Bearer ' + token,
        //     },
        // });
        console.log(payload)
        setIsLoading(false);
    }

    // role: 0
    return (
        <>
            <Head>
                <title>sign up | hypno™</title>
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
                        <h1 className='text-white text-3xl sm:text-5xl'>sign up.</h1>
                        <form className='flex flex-col gap-4 w-full my-4' onSubmit={handleSubmit(submitSignup)}>
                            <input
                                className={`input sm:input-lg ${errors['user.first_name'] && 'error text-red-600'}`}
                                placeholder={`first name${errors['user.first_name'] ? (errors['user.first_name']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                {...register('user.first_name', {
                                    required: true,
                                })}
                            />
                            <input
                                className={`input sm:input-lg ${errors['user.last_name'] && 'error text-red-600'}`}
                                placeholder={`last name${errors['user.last_name'] ? (errors['user.last_name']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                {...register('user.last_name', {
                                    required: true,
                                })}
                            />
                            <input
                                className={`input sm:input-lg ${errors['organization.name'] && 'error text-red-600'}`}
                                placeholder={`organization name${errors['organization.name'] ? (errors['organization.name']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                {...register('organization.name', {
                                    required: true,
                                })}
                            />
                            <input
                                className={`input sm:input-lg ${errors['user.email'] && 'error text-red-600'}`}
                                placeholder={`email${errors['user.email'] ? (errors['user.email']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                {...register('user.email', {
                                    required: true,
                                    pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                                })}
                            />
                            <input
                                className={`input sm:input-lg ${errors['user.password'] && 'error text-red-600'}`}
                                placeholder={`password${errors['user.password'] ? (errors['user.password']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                type='password'
                                {...register('user.password', {
                                    required: true,
                                })}
                            />
                            <input type='submit' value='continue →' className='btn btn-gallery sm:btn-lg btn-primary rounded-full mt-3' />
                        </form>
                        <Link href='/login' className='text-white/30 hover:text-white transition-colors text-lg'>already have an account?</Link>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    )
}
