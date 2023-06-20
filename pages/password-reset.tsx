import { Footer } from '@/components/Footer'
import Head from 'next/head'
import Image from 'next/image'
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import FormControl from '@/components/Form/FormControl';
import { ThreeDots } from 'react-loader-spinner';
import clsx from 'clsx';
import ForgotPasswordForm from '@/components/PasswordReset/ForgotPasswordForm';
import ResetPasswordForm from '@/components/PasswordReset/ResetPasswordForm';

export default withAuth(ResetPasswordPage, 'auth');
function ResetPasswordPage() {
    const { query } = useRouter();
    const resetPasswordToken = query.reset_password_token;
    const isForgotPassword = _.isEmpty(resetPasswordToken);

    return (
        <>
            <Head>
                <title>{isForgotPassword ? 'forgot password' : 'reset password'} | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <main className='fixed inset-0 bg-black w-screen min-h-screen'>
                    <div className='hero min-h-screen'>
                        <div className='hero-content sm:max-w-2xl w-full flex-col items-start space-y-9'>
                        {isForgotPassword ?
                            <ForgotPasswordForm />
                            :
                            <ResetPasswordForm token={String(resetPasswordToken)} />
                        }
                        </div>
                    </div>
                    <Footer />
                </main>
            </GlobalLayout>
        </>
    )
}
