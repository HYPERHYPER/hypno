import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Modal from '@/components/Modal';
import NewUserModal from '@/components/Users/NewUserModal';
import Minus from 'public/pop/minus.svg';

export default withAuth(OrganizationUsersPage, 'protected');
function OrganizationUsersPage() {
    const user = useUserStore.useUser();

    return (
        <>
            <Head>
                <title>organization users | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title='users'
                    returnLink={{ slug: '/org', name: 'organization'}}
                >
                    <Modal.Trigger id='new-user-modal'><h2 className='text-primary cursor-pointer'>new user</h2></Modal.Trigger>
                </GlobalLayout.Header>

                <NewUserModal />

                <GlobalLayout.Content>
                    <div className='list pro'>
                        <Item />
                        <Item />
                        <Item />
                        <Item />
                        <Item />
                    </div>
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    )
}

const Item = ({ name }: { name?: string }) => {
    return (
        <div className='item'>
            <div className='space-x-3'>
                <span className='text-white text-4xl'>username</span>
                <span className='text-white/40 text-4xl'>name</span>
                <span className='text-white/40 text-xl'>device</span>
            </div>
            <div className='flex gap-5 text-primary lowercase'>
                <span>role</span>
                <span className='bg-white/20 h-10 w-10 flex items-center justify-center rounded-full text-black'><Minus /></span>
            </div>
        </div>
    )
}