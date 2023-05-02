import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Link from 'next/link';

export default withAuth(AccountPage, 'protected');
function AccountPage() {
    const user = useUserStore.useUser();

    return (
        <>
            <Head>
                <title>organization events | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header>
                    <h1>Organization Events</h1>
                    <div className='sm:mt-4'>
                        <h2 className='sm:text-2xl text-white/40'>View + manage your organization's events.</h2>
                    </div></GlobalLayout.Header>
                <GlobalLayout.Content>
                    <div className='px-6 sm:px-2 mt-[80px] sm:mt-[130px] space-y-8'>
                        <div className='sm:space-y-3'>
                            <h1 className='text-3xl sm:text-6xl text-white tracking-tight'>organization name</h1>
                            <h3 className='text-xl text-white/40 font-medium tracking-tight'># events</h3>
                        </div>

                        <div className='text-right'>
                            <Link href='/create' className='btn btn-primary rounded-full'>+ create event</Link>
                        </div>
                        <div className='rounded-box space-y-3 text-white/40 font-medium tracking-tight'>
                            <div className='divider' />
                            <div className='flex justify-between'>username <span className='text-white'>syd</span></div>
                            <div className='divider' />
                            <div className='flex justify-between'>email <span className='text-white'>{user.email}</span></div>
                            <div className='divider' />
                            <div className='flex justify-between'>organization <span className='text-white'>hypno</span></div>
                            <div className='divider' />
                        </div>
                    </div>
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    )
}
