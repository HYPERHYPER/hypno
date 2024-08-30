import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Modal from '@/components/Modal';
import NewUserModal from '@/components/Users/NewUserModal';
import AddUser from 'public/pop/person-plus.svg';
import { GetServerSideProps } from 'next';
import nookies from 'nookies';
import axios from 'axios';
import useSWRInfinite from 'swr/infinite';
import { axiosGetWithToken, fetchWithToken } from '@/lib/fetchWithToken';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useContext, useEffect, useState } from 'react';
import { getEventPrivileges, getOrganizationPrivileges } from '@/helpers/user-privilege';
import { PrivilegeContext, PrivilegeProvider } from '@/components/PrivilegeContext/PrivilegeContext';
import useSWR from 'swr';
import useOrgAccessStore from '@/store/orgAccessStore';
import { Organization } from '@/types/organizations';
import FormControl from '@/components/Form/FormControl';
import clsx from 'clsx';
import { SaveStatus } from '@/components/Form/AutosaveStatusText';
import { useForm } from 'react-hook-form';

const userRoles = [
    // { name: 'photographer', id: 4 },
    { name: 'member', id: 3 },
    { name: 'admin', id: 2 }
];

interface ResponseData {

}

export default withAuth(GlobalInvitePage, 'hypno');
function GlobalInvitePage(props: ResponseData) {
    const user = useUserStore.useUser();
    const token = useUserStore.useToken();

    const organizations = useOrgAccessStore.useOrganizations();
    const getOrganizations = useOrgAccessStore.useGetOrganizations();
    const isLoadingOrgs = useOrgAccessStore.useIsLoading();
    useEffect(() => {
        getOrganizations();
    }, []);

    const [status, setStatus] = useState<SaveStatus>('ready');
    const {
        register,
        setValue,
        watch,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            organization_id: _.first(organizations)?.id || 1,
            email: '',
            role: 3,
        }
    })

    const inviteData = watch();
    const inviteUser = async (data: any) => {
        setStatus('saving');

        if (!_.isEmpty(errors)) {
            console.log("submitForm errors", { errors });
            setStatus('error');
            return;
        }

        let payload = {
            invite: {
                ...data,
            }
        }

        console.log(payload)

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/global_invite`;
        await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token.access_token,
            },
        }).then((res) => {
            console.log(res)
            setStatus('success')
            setTimeout(() => {
                setStatus('ready');
                reset();
            }, 3000);
        }).catch((e) => {
            console.log(e);
            setStatus('error');
            setTimeout(() => {
                setStatus('ready');
                reset();
            }, 8000);
        })
    }

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
                    title='global invite'
                    returnLink={{ slug: '/settings', name: 'settings' }}
                >
                    <h2>hypno-only access below to invite user to any organization</h2>
                </GlobalLayout.Header>

                {/* {(orgData && (userOrgPrivileges?.canInviteMember || userOrgPrivileges?.canInviteAdmin)) && <NewUserModal />} */}

                <GlobalLayout.Content>
                    <form 
                        onSubmit={handleSubmit(inviteUser)}
                        className='border-t-2 border-white/20'
                    >
                        <FormControl label='organization'>
                            {isLoadingOrgs ?
                                <span className='loading loading-spinner loading-sm sm:loading-md' />
                                : (
                                    <select
                                        onChange={(e) => setValue('organization_id', Number(e.target.value))}
                                        value={inviteData.organization_id}
                                        className='select pro-form pl-0 w-full text-right min-h-0 h-auto font-normal lowercase bg-transparent active:bg-transparent sm:text-3xl'
                                    >
                                        {_.map(organizations, ((o) => <option key={o.id} value={o.id}>{o.name}</option>))}
                                    </select>
                                )}
                        </FormControl>

                        <FormControl label='email'>
                            <input 
                                className='input pro flex-1'
                                placeholder='invitee@hypno.com' 
                                {...register('email')}
                            />
                        </FormControl>

                        <FormControl label='role'>
                            <div className='flex gap-3 sm:text-3xl'>

                                {_.map(userRoles, (u, i) => (
                                    <span
                                        key={i}
                                        onClick={() => setValue('role', u.id)} 
                                        className={clsx(
                                            'cursor-pointer transition',
                                            u.id == inviteData.role ? 'text-primary' : 'text-primary/40'
                                        )}>
                                        {u.name}
                                    </span>
                                ))}
                            </div>
                        </FormControl>

                        <FormControl label={status === 'ready' ? 'ready?' : ''} >
                            <div className='sm:text-3xl '>
                                {status === 'ready' && (
                                    <button type='submit' className='tracking-[-0.03em] text-black bg-primary disabled:text-white/20 disabled:bg-white/10 py-1 px-3 sm:py-3 sm:px-5 rounded-[10px] sm:rounded-[15px] transition-colors' disabled={!inviteData.email}>
                                        send invite
                                    </button>
                                )}
                                {status === 'saving' && <span className='text-white/40'>sending <span className='loading' /></span>}
                                {status === 'success' && <span className='text-white/40'>invite sent!</span>}
                                {status === 'error' && <span className='text-red-500'>something went wrong...</span>}
                            </div>
                        </FormControl>
                    </form>
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    )
}

const Item = ({ organization }: { organization: Organization }) => {
    if (!organization) return null;
    const { id, name, metadata } = organization;
    return (
        <div className='item'>
            <div className='space-x-3 tracking-tight lowercase flex'>
                {name && <span className='text-white sm:text-3xl'>{name}</span>}
                {metadata?.hypno_pro && <span className='text-white/40 sm:text-3xl'>{metadata.hypno_pro.current_tier}</span>}
                {/* <span className='text-white/40 text-xl'>device</span> */}
            </div>
            <div className='flex items-center gap-3 sm:gap-5 text-primary lowercase'>
                {/* <span>{roles === 'account_owner' ? 'owner' : _.first(roles)?.kind}</span> */}
                <button className='p-4'>
                    <div className='sm:icon'>
                        <AddUser />
                    </div>
                </button>
            </div>
        </div>
    )
}