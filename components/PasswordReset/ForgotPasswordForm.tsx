import { useState } from "react";
import { useForm } from "react-hook-form";
import _ from 'lodash';
import FormControl from "../Form/FormControl";
import clsx from "clsx";
import { ThreeDots } from "react-loader-spinner";
import axios from "axios";
import Letter from 'public/pop/letter.svg';

export default function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
        }
    });

    const submitTriggerPasswordReset = async (data: any) => {
        setIsLoading(true)
        if (!_.isEmpty(errors)) {
            setIsLoading(false);
            console.log("submitTriggerPasswordReset errors", { errors });
            return;
        }

        setError('');

        console.log("submitTriggerPasswordReset", { data });
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/trigger_password_reset`;
        const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
        await axios.post(url, { ...data }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        }).then(() => {
            setIsLoading(false);
            setSuccess(true);
        }).catch((e) => {
            console.log(e);
            setIsLoading(false);
            setError('something went wrong');
        })

    }

    return (
        <>
            <div className='space-y-3'>
                <h1 className='text-white'>{success ? 'success!' : 'forgot password'}</h1>
                <h1 className='text-primary text-3xl'>password reset link will be sent to your email</h1>
            </div>
            {!success ? (
                <>
                    <form className='flex flex-col w-full border-t-2 border-white/20' onSubmit={handleSubmit(submitTriggerPasswordReset)}>
                        <FormControl label='email'>
                            <input
                                className={`input pro ${errors['email'] && 'error text-red-600'}`}
                                placeholder={`${errors['email'] ? (errors['email']?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                {...register('email', {
                                    required: true,
                                })}
                            />
                        </FormControl>
                        <input type='submit' value='ok' className={clsx('btn btn-primary rounded-lg mt-10 text-4xl h-[80px]', isLoading && 'hidden')} />
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
                        <div className="alert alert-error justify-center font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>oops! {error.toLowerCase()}</span>
                        </div>
                    )}
                </>
            ) : (
                <div className='text-white/50 w-full space-y-10'>
                    <p className='text-xl flex flex-row items-center gap-3'><span className="text-primary"><Letter /></span> check your email inbox for a reset password link</p>
                    <button onClick={() => setSuccess(false)} className='btn btn-primary rounded-lg mt-10 text-4xl h-[80px] w-full'>try again</button>
                </div>
            )}
        </>

    )
}