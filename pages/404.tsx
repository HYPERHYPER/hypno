import Head from 'next/head'
import _ from 'lodash';
import GlobalLayout from '@/components/GlobalLayout';
import withAuth from '@/components/hoc/withAuth';
import useUserStore from '@/store/userStore';
import { useRouter } from 'next/router';

export default function NotFoundPage() {
    const isLoggedIn = useUserStore.useIsLoggedIn();
    const router = useRouter();

    // Check if we are on the client-side
    if (typeof window !== 'undefined' && !isLoggedIn) {
        router.replace('/login');
    }

    return (
        <>
            <Head>
                <title>oops! | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title='oops! 404!'
                >
                    <h2>this page does not exist or you don&apos;t have access...</h2>
                </GlobalLayout.Header>
            </GlobalLayout>
        </>
    )
}


