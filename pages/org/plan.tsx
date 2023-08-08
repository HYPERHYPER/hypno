import Head from 'next/head'
import _ from 'lodash';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import useCountdown from '@/hooks/useCountdown';

interface ResponseData {
    user_count: number;
}

export default withAuth(PlanConfirmationPage, 'optional');
function PlanConfirmationPage(props: ResponseData) {
    const router = useRouter();
    const { query } = router;

    const isSuccess = String(query.success) == 'true';

    const secondsToRedirect: number = 5;
    const timeLeft = useCountdown(secondsToRedirect);

    useEffect(() => {
        const redirectTimer = setTimeout(() => {
            router.push('/dashboard');
        }, secondsToRedirect * 1000);

        return () => clearTimeout(redirectTimer);
    }, []);

    return (
        <>
            <Head>
                <title>plan update | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title={isSuccess ? 'success! your plan has been updated' : 'there was a problem updating your plan'}
                >
                    <h2 className='text-white/40'>
                        {timeLeft > 0 ? (
                            `redirecting in ${timeLeft} seconds...`
                        ) : (
                            `redirecting...`
                        )}
                    </h2>
                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <div className='flex min-h-[40vh] justify-center items-center'>
                        <span className="loading loading-ring loading-lg sm:w-[200px] text-primary"></span>
                    </div>
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query } = context;

    if (_.isEmpty(query.success)) {
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false, // Set to true for a permanent redirect (HTTP 301) or false for a temporary redirect (HTTP 302)
            },
        };
    }
    return { props: {} }
}

