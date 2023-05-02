import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Link from 'next/link';
import Modal from '@/components/Modal';
import FormControl from '@/components/Form/FormControl';
import { parseCookies } from 'nookies';
import axios from 'axios';
import { useRef } from 'react';

export default withAuth(SettingsPage, 'protected');
function SettingsPage() {
    const user = useUserStore.useUser();
    const logout = useUserStore.useLogout();

    const usernameRef = useRef<HTMLInputElement>(null);
    const updateUser = async (field: string, value?: string) => {
        // setSavedChangesStatus('saving');
        // if (!_.isEmpty(errors)) {
        //     console.log("submitForm errors", { errors });
        //     return;
        // }

        /* Update user payload */
        let payload = {
            user: {
                email: field == 'email' ? value : user.email,
                first_name: field == 'first_name' ? value : user.first_name,
                last_name: field == 'last_name' ? value : user.last_name,
                username: field == 'username' ? value : user.username,
            }
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/complete_pro_registration`;
        const token = parseCookies().hypno_token;
        const res = await axios.put(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        })
    }

    return (
        <>
            <Head>
                <title>{user.first_name} {user.last_name} | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title='settings'
                    right={
                        <div className='avatar placeholder'>
                            <div className="bg-white/20 text-white rounded-full w-[120px]">
                                <span className="text-4xl uppercase">{user.first_name.charAt(0)}{user.last_name.charAt(0)}</span>
                            </div>
                        </div>
                    }
                >
                    <button onClick={logout}><h2 className='text-primary'>sign out</h2></button>
                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <div className='list pro'>
                        <Item name='username' value={user.username || '+'} modalId='username-modal' />
                        <Item name='email' value={user.email} />
                        <Item name='password' value={'•••••••'} />
                        <Item name='organization' value={user.organization.name} href='/org' />
                        <Item name='upgrade' value={'unlock custom graphics, effects and more!'} />
                    </div>
                </GlobalLayout.Content>

                <Modal id='username-modal' title='edit username' onDone={() => updateUser('username', usernameRef.current?.value)}>
                    <div className='list pro'>
                        <FormControl label='username'>
                            <input ref={usernameRef} className='input pro' defaultValue={user.username} />
                        </FormControl>
                    </div>
                </Modal>
            </GlobalLayout>
        </>
    )
}

const Item = ({ name, value, href, modalId }: { name: string, value: string, href?: string, modalId?: string, }) => {
    return (
        <div className='item'>
            <span className='text-white/40'>{name}</span>
            <label htmlFor={modalId} className='text-primary lowercase'>
                {href ? <Link href={href}>{value}</Link> : value}
            </label>
        </div>
    )
}
