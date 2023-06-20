import { Footer } from '@/components/Footer'
import Head from 'next/head'
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import { useState } from 'react';
import Link from 'next/link';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import FormControl from '@/components/Form/FormControl';
import { useRouter } from 'next/router';

export default withAuth(SignupPage, 'auth');
function SignupPage() {
    const { query } = useRouter();
    const isInviteSignup = !_.isEmpty(query.inviter_user_id) && !_.isEmpty(query.organization_id) && !_.isEmpty(query.role);

    const signup = useUserStore.useSignup();
    const error = useUserStore.useError();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string>('');
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const submitSignup = async (data: any) => {
        setIsLoading(true)
        const passwordConfirmed = data.user.password === data.confirm_password;
        if (!_.isEmpty(errors) || !passwordConfirmed) {
            setIsLoading(false);
            console.log("submitSignup errors", { errors });
            if (!passwordConfirmed) {
                setPasswordError('your passwords do not match.')
            }
            return;
        }

        setPasswordError('');
        console.log("submitSignup", { data });
        const { user } = data;
        const invite = isInviteSignup ? {
            inviter_user_id: String(query.inviter_user_id),
            organization_id: String(query.organization_id),
            role: String(query.role),
        } : undefined;

        signup(user, invite)
        setIsLoading(false);
    }

    return (
        <>
            <Head>
                <title>sign up | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <main className='absolute inset-0 bg-black w-screen min-h-screen sm:mt-[150px]'>
                    <div className='hero min-h-screen sm:min-h-full'>
                        <div className='hero-content sm:max-w-3xl w-full text-left flex-col items-start space-y-9'>
                            <div className='space-y-3'>
                                <h1 className='text-white'>sign up</h1>
                                {!isInviteSignup ? 
                                    <div><Link href='/login' className='text-primary hover:underline transition-colors text-3xl'>already have an account?</Link></div> 
                                    :
                                    <h2 className='text-3xl text-primary'>+ accept invite to join organization</h2>
                                }
                            </div>
                            <form className='flex flex-col w-full border-t-2 border-white/20' onSubmit={handleSubmit(submitSignup)}>
                            <FormControl label='email'>
                                    <input
                                        className={`input pro ${errors['user.email'] && 'error text-red-600'}`}
                                        placeholder={`${errors['user.email'] ? (errors['user.email']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('user.email', {
                                            required: true,
                                            pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                                        })}
                                    />
                                </FormControl>
                                <FormControl label='first name'>
                                    <input
                                        className={`input pro ${errors['user.first_name'] && 'error text-red-600'}`}
                                        placeholder={`${errors['user.first_name'] ? (errors['user.first_name']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('user.first_name', {
                                            required: true,
                                        })}
                                    />
                                </FormControl>

                                <FormControl label='last name'>
                                    <input
                                        className={`input pro ${errors['user.last_name'] && 'error text-red-600'}`}
                                        placeholder={`${errors['user.last_name'] ? (errors['user.last_name']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('user.last_name', {
                                            required: true,
                                        })}
                                    />
                                </FormControl>

                                <FormControl label='username'>
                                    <input
                                        className={`input pro ${errors['user.username'] && 'error text-red-600'}`}
                                        placeholder={`${errors['user.username'] ? (errors['user.username']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        {...register('user.username', {
                                            required: true,
                                        })}
                                    />
                                </FormControl>

                                <FormControl label='password'>
                                    <input
                                        className={`input pro ${errors['user.password'] && 'error text-red-600'}`}
                                        placeholder={`${errors['user.password'] ? (errors['user.password']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        type='password'
                                        {...register('user.password', {
                                            required: true,
                                        })}
                                    />
                                </FormControl>

                                <FormControl label='confirm password'>
                                    <input
                                        className={`input pro ${errors['confirm_password'] && 'error text-red-600'}`}
                                        placeholder={`${errors['confirm_password'] ? (errors['confirm_password']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                        type='password'
                                        {...register('confirm_password', {
                                            required: true,
                                        })}
                                    />
                                </FormControl>
                                <input type='submit' value='ok' className='btn btn-primary rounded-lg mt-10 text-4xl h-[80px]' />
                            </form>
                            
                            {error || passwordError && (
                                <div className="alert alert-error justify-center mt-3">
                                    <div className='font-medium'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>oops! {error.toLowerCase()}</span>
                                        <span>{passwordError}</span>
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
