import Head from 'next/head'
import _, { debounce } from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Link from 'next/link';
import Modal from '@/components/Modal';
import FormControl from '@/components/Form/FormControl';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import nookies from 'nookies';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AutosaveStatusText, SaveStatus } from '@/components/Form/AutosaveStatusText';

interface ResponseData {
    user_count: number;
}

export default withAuth(OrganizationSettingsPage, 'protected');
function OrganizationSettingsPage(props: ResponseData) {
    const user = useUserStore.useUser();
    const updateUser = useUserStore.useUpdateUser();
    const token = useUserStore.useToken();
    const { organization } = user;

    const [saveStatus, setSaveStatus] = useState<SaveStatus>('ready');
    const {
        register,
        handleSubmit,
        formState: { isDirty, errors },
        reset
    } = useForm({
        defaultValues: {
            name: organization.name || '',
        }
    });

    const updateOrganizationName = async (data: any) => {
        if (!_.isEmpty(errors)) {
            console.log("submitForm errors", { errors });
            setSaveStatus('error');
            return;
        }

        /* Update user payload */
        let payload = {
            organization: {
                ...data
            }
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${organization.id}`;
        await axios.put(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token.access_token,
            },
        }).then((res) => {
            setSaveStatus('success')
            setTimeout(() => {
                setSaveStatus('ready')
            }, 3000)
            updateUser({
                organization: {
                    ...data
                }
            });
            reset(data);
        }).catch((e) => {
            console.log(e);
            setSaveStatus('error')
        })
    }

    const debouncedSave = useCallback(
        debounce(() => {
            handleSubmit(updateOrganizationName)();
            return;
        }, 1000),
        []
    );

    useEffect(() => {
        if (isDirty) {
            setSaveStatus('saving');
            debouncedSave();
        }
    }, [isDirty]);


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
                        {/* <Item name='org events' value={'#'} /> */}
                        <Item name='org users' value={String(props.user_count || 0)} href='/org/users' />
                        {/* <Item name='next payment' value={user.organization_id} /> */}
                        {/* <Item name='payment method' value={'update'} /> */}
                        {/* <Item name='subscription' value={'enterprise'} /> */}
                    </div>
                </GlobalLayout.Content>

                <Modal 
                    id='org-name-modal' 
                    title='edit org name' 
                    menu={AutosaveStatusText(saveStatus)}
                    >
                    <div className='list pro'>
                        <FormControl label='name'>
                            <input 
                                {...register('name', { required: true })}
                                className='flex-1 input pro lowercase' 
                            />
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
                {href ? <Link href={href}>{value} →</Link> : value}
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
        return {
            notFound: true,
        }
    })

    return {
        props: {
            user_count: data?.meta?.total_count || null,
        }
    };
};

