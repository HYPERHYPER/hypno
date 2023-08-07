import Head from 'next/head'
import _, { debounce } from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Link from 'next/link';
import Modal from '@/components/Modal';
import FormControl from '@/components/Form/FormControl';
import axios from 'axios';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { AutosaveStatusText, SaveStatus } from '@/components/Form/AutosaveStatusText';
import Plus from 'public/pop/plus.svg';
import FileInput from '@/components/Form/FileInput';
import UpdatePasswordModal from '@/components/Settings/UpdatePasswordModal';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { axiosGetWithToken } from '@/lib/fetchWithToken';
import useSWR from 'swr';

export default withAuth(SettingsPage, 'protected');
function SettingsPage() {
    const router = useRouter();
    const user = useUserStore.useUser();
    const logout = useUserStore.useLogout();
    const updateUser = useUserStore.useUpdateUser();
    const token = useUserStore.useToken();

    const orgUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${user.organization.id}`;
    const { data: orgData, isValidating: isValidatingOrgData, error: orgError } = useSWR([orgUrl, token.access_token],
        ([url, token]) => axiosGetWithToken(url, token))

    const orgTier = orgData?.organization.metadata.hypno_pro.current_tier;
        
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('ready');
    const {
        register,
        handleSubmit,
        formState: { isDirty, errors },
        reset,
        setValue,
        watch
    } = useForm({
        defaultValues: {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            username: user?.username || '',
            email: user?.email || '',
            avatar: user?.avatar || '',
        }
    });
    const userConfig = watch();

    const handleErrors = (data: any) => {
        if (!_.isEmpty(errors)) {
            console.log("submitForm errors", { errors });
            setSaveStatus('error');
            return;
        }
    }

    const handleUpdateUser = async (data: any) => {
        if (!_.isEmpty(errors)) {
            console.log("submitForm errors", { errors });
            setSaveStatus('error');
            return;
        }

        /* Update user payload */
        let payload = {
            user: {
                ...data
            }
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/users/${user.id}`;
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
                ...data
            });
            reset(data);
        }).catch((e) => {
            console.log(e);
            setSaveStatus('error')
        })
    }

    const debouncedSave = useCallback(
        debounce(() => {
            handleSubmit(handleUpdateUser, handleErrors)();
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

    const handleLogout = () => {
        logout();
        router.push('/login'); // Redirect to the login page after logout
    };

    const handleBillingRedirect = async () => {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${user.organization.id}/billing_portal`;
        await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token.access_token,
            },
        }).then((res) => {
            if (res.status == 200) {
                const billingUrl = res.data.url;
                window.location.href = billingUrl;
            }
        }).catch((e) => {
            console.log(e);
        })
    }

    if (!user) return <>Loading</>
    return (
        <>
            <Head>
                <title>{user.first_name} {user.last_name} | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout paymentPlansModal={true}>
                <GlobalLayout.Header
                    title='settings'
                    right={
                        <div className='avatar placeholder indicator'>
                            <div className="bg-white/20 text-white rounded-full w-[120px] overflow-clip">
                                {user.avatar ?
                                    <Image src={user.avatar} alt={`${user.username}-avatar`} fill className='rounded-full' />
                                    :
                                    <span className="text-4xl uppercase">{user.first_name.charAt(0)}{user.last_name.charAt(0)}</span>
                                }
                            </div>
                            <Modal.Trigger id='avatar-modal'>
                                <span className="indicator-item indicator-top indicator-end translate-x-1 translate-y-1 btn btn-primary btn-sm btn-circle rounded-full"><Plus /></span>
                            </Modal.Trigger>
                        </div>
                    }
                >
                    <button onClick={handleLogout}><h2 className='text-primary'>sign out</h2></button>
                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <div className='list pro'>
                        <Item name='username' value={user.username || '+'} modalId='username-modal' />
                        <Item name='name' value={`${user.first_name} ${user.last_name}` || ''} modalId='name-modal' />
                        <Item name='email' value={user.email} modalId='email-modal' />
                        <Item name='password' value={'change'} modalId='password-modal' />
                        <Item name='organization' value={user.organization.name} href='/org' />
                        <Item name='plan' value={
                            <>{orgData?.organization && <span className='cursor-pointer' onClick={() => window.payment_plans_modal.showModal()}>{orgTier}</span>}</>
                        } />
                        <Item name='billing' value={
                            <>{orgTier && orgTier == 'free' ? <span className='text-white/20'>none</span> : <span className='cursor-pointer' onClick={handleBillingRedirect}>manage →</span>}</>
                        } />
                    </div>
                </GlobalLayout.Content>

                <Modal
                    id='username-modal'
                    title='edit username'
                    menu={AutosaveStatusText(saveStatus)}>
                    <div className='list pro'>
                        <FormControl label='username'>
                            <input {...register('username', { required: true })} className='input pro' />
                        </FormControl>
                    </div>
                </Modal>

                <Modal
                    id='name-modal'
                    title='edit name'
                    menu={AutosaveStatusText(saveStatus)}>
                    <div className='list pro'>
                        <FormControl label='first name'>
                            <input {...register('first_name')} className='input pro' />
                        </FormControl>
                        <FormControl label='last name'>
                            <input {...register('last_name')} className='input pro' />
                        </FormControl>
                    </div>
                </Modal>

                <Modal
                    id='email-modal'
                    title='edit email'
                    menu={AutosaveStatusText(saveStatus)}>
                    <div className='list pro'>
                        <FormControl label='email'>
                            <input {...register('email', {
                                required: true,
                                validate: {
                                    maxLength: (v: string) =>
                                        v.length <= 50 || "exceeds character limit",
                                    matchPattern: (v: string) =>
                                        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v) ||
                                        "not a valid email address",
                                },
                            })} className='input pro' />
                        </FormControl>
                    </div>
                </Modal>

                <UpdatePasswordModal />

                <Modal
                    id='avatar-modal'
                    title='add avatar'
                    menu={AutosaveStatusText(saveStatus)}>
                    <div className='border-white/20 border-b-2 pb-3 sm:pb-7 flex justify-center' >
                        <div className='avatar placeholder'>
                            <div className="bg-white/20 text-white rounded-full w-[250px]">
                                {user.avatar ?
                                    <Image src={user.avatar} alt={`${user.username}-avatar`} fill className='rounded-full' />
                                    :
                                    <span className="text-4xl uppercase">{user.first_name.charAt(0)}{user.last_name.charAt(0)}</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='list pro'>
                        <FormControl>
                            <FileInput
                                inputId='avatar'
                                onInputChange={(value: string) => setValue('avatar', value, { shouldDirty: true })}
                                value={userConfig.avatar}
                                uploadCategory='user'
                            />
                        </FormControl>
                    </div>
                </Modal>
            </GlobalLayout>
        </>
    )
}

const Item = ({ name, value, href, modalId }: { name: string, value: string | ReactNode, href?: string, modalId?: string, }) => {
    return (
        <div className='item'>
            <span className='text-white/40'>{name}</span>
            <label htmlFor={modalId} className={clsx('text-primary lowercase', modalId && 'cursor-pointer')}>
                {href ? <Link href={href}>{value} →</Link> : value}
            </label>
        </div>
    )
}
