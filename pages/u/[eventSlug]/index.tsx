import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Link from 'next/link';

export default withAuth(EventPage, 'protected');
function EventPage() {
    const user = useUserStore.useUser();

    return (
        <>
            <Head>
                <title>event | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title='users'
                    returnLink={{slug: '/event', name: 'event'}}
                >
                    <Link href=''><h2 className='text-primary'>new user</h2></Link>
                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <div className='divider' />
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    )
}
