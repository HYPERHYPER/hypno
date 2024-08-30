import { useState } from "react";
import { useForm } from "react-hook-form";
import _ from 'lodash';
import FormControl from "../Form/FormControl";
import clsx from "clsx";
import { ThreeDots } from "react-loader-spinner";
import Link from "next/link";
import axios from "axios";

export default function ResetPasswordForm({token} : {token?: string}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: {
            password: '',
            confirm_password: '',
        }
    });
    const formData = watch();

    const submitResetPassword = async (data: any) => {
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
        const payload = {
            user: {
                password: data.password,
                reset_password_token: token,
            }
        }
        
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/finish_password_reset`;
        await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(() => {
            setIsLoading(false);
            setSuccess(true);
        }).catch(() => {
            setIsLoading(false);
            setError('something went wrong');
        })

    }

    return (
        <>
            <div className='space-y-3'>
                <h1 className='text-white'>{success ? 'success!' : 'reset password'}</h1>
                <h2 className='text-primary'>enter and confirm your new password</h2>
            </div>
            {!success ? (
                <>
                    <form className='flex flex-col w-full border-t-2 border-white/20' onSubmit={handleSubmit(submitResetPassword)}>
                        <FormControl label='new password'>
                            <input
                                className={`input pro ${errors['password'] && 'error text-red-600'}`}
                                placeholder={`${errors['password'] ? (errors['password']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                type='password'
                                {...register('password', {
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
                        <input type='submit' value='reset' className={clsx('btn btn-primary rounded-[10px] sm:rounded-lg mt-10 text-base sm:text-4xl h-[20px] sm:h-[80px]', isLoading && 'hidden')} />
                        {isLoading && <button disabled className='btn btn-primary rounded-lg mt-10 text-4xl h-[80px]'>
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
                    <p className='text-xl'>you&apos;re all set! <br />you can now use your new password to login.</p>
                    <Link href='/login' className='w-full btn btn-primary rounded-lg mt-10 text-4xl h-[80px]'>continue to login →</Link>
                </div>
            )}
        </>

    )
}