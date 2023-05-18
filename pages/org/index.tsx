import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Link from 'next/link';
import Modal from '@/components/Modal';
import FormControl from '@/components/Form/FormControl';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import nookies, { parseCookies } from 'nookies';
import { useRef } from 'react';

interface ResponseData {
    user_count: number;
}

export default withAuth(OrganizationSettingsPage, 'protected');
function OrganizationSettingsPage(props: ResponseData) {
    const user = useUserStore.useUser();
    const { organization } = user;

    const orgNameRef = useRef<HTMLInputElement>(null);
    const updateOrganizationName = async (value?: string) => {
        // setSavedChangesStatus('saving');
        // if (!_.isEmpty(errors)) {
        //     console.log("submitForm errors", { errors });
        //     return;
        // }

        /* Update user payload */
        let payload = {
            organization: {
                name: value,
            }
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${organization.id}`;
        const token = parseCookies().hypno_token;
        const res = await axios.put(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        })

        console.log(res.data);
    }
    return (
        <>
            <Head>
                <title>organization settings | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title='organization'
                    returnLink={{ slug: '/settings', name: 'settings' }}
                >
                    <h2 className='text-white/40'>since Apr 2023</h2>
                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <div className='list pro'>
                        <Modal.Trigger id='org-name-modal'><Item name='org name' value={organization.name} /></Modal.Trigger>
                        <Item name='org events' value={'#'} />
                        <Item name='org users' value={String(props.user_count)} href='/org/users' />
                        <Item name='next payment' value={user.organization_id} />
                        <Item name='payment method' value={'update'} />
                        <Item name='subscription' value={'enterprise'} />
                    </div>
                </GlobalLayout.Content>

                <Modal 
                    id='org-name-modal' 
                    title='edit org name' 
                    onDone={() => updateOrganizationName(orgNameRef.current?.value)}>
                    <div className='list pro'>
                        <FormControl label='name'>
                            <input 
                                ref={orgNameRef}
                                className='flex-1 input pro lowercase' 
                                defaultValue={organization.name} />
                        </FormControl>
                    </div>
                </Modal>
            </GlobalLayout>
        </>
    )
}

const Item = ({ name, value, href }: { name: string, value: string, href?: string, }) => {
    return (
        <div className='item'>
            <span className='text-white/40'>{name}</span>
            <span className='text-primary lowercase'>
                {href ? <Link href={href}>{value}</Link> : value}
            </span>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // Fetch organization users
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/users?per_page=1`;
    const token = nookies.get(context).hypno_token;
    let data: any = {};

    await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    }).then(async (res) => {
        if (res.status === 200) {
            data = res.data;
        }
    }).catch((e) => {
        console.log(e);
    })

    return {
        props: {
            user_count: data?.meta?.total_count,
        }
    };
};

