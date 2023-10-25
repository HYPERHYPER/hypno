import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Modal from '@/components/Modal';
import NewUserModal from '@/components/Users/NewUserModal';
import Minus from 'public/pop/minus.svg';
import { GetServerSideProps } from 'next';
import nookies from 'nookies';
import axios from 'axios';
import useSWRInfinite from 'swr/infinite';
import { axiosGetWithToken, fetchWithToken } from '@/lib/fetchWithToken';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useContext, useEffect } from 'react';
import { getEventPrivileges, getOrganizationPrivileges } from '@/helpers/user-privilege';
import { PrivilegeContext, PrivilegeProvider } from '@/components/PrivilegeContext/PrivilegeContext';
import useSWR from 'swr';

type OrgUser = {
    username?: string;
    email?: string;
    id?: number;
    organization_id?: number;
    first_name?: string;
    last_name?: string;
    roles?: string | Array<any>;
}

interface ResponseData {
    users: OrgUser[];
    meta: {
        current_page: number;
        next_page: number;
        per_page: number;
        prev_page: number;
        total_count: number;
        total_pages: number;
    };
}

export default withAuth(OrganizationUsersPage, 'protected');
function OrganizationUsersPage(props: ResponseData) {
    const { users: initialUsers, meta } = props;
    const user = useUserStore.useUser();
    const org_id = user.organization.id;

    const token = useUserStore.useToken();

    const orgUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${org_id}`;
    const { data: orgData, isValidating: isValidatingOrgData, error: orgError } = useSWR([orgUrl, token.access_token],
        ([url, token]) => axiosGetWithToken(url, token))

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && pageIndex == previousPageData.pages) return null; // reached the end
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/users?per_page=30`;
        if (pageIndex === 0) return [url, token.access_token];
        const pageIdx = previousPageData.meta.next_page;
        return [`${url}&page=${pageIdx}`, token.access_token];
    }

    const { data, size, setSize, error, isValidating } = useSWRInfinite(getKey,
        ([url, token]) => axiosGetWithToken(url, token));

    const paginatedUsers = _.map(data, (v) => v.users).flat();

    const userOrgPrivileges = orgData ? getOrganizationPrivileges(orgData.organization.user_privileges) : null;
    return (
        <>
            <Head>
                <title>organization users | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <PrivilegeProvider privileges={userOrgPrivileges}>
                <GlobalLayout>
                    <GlobalLayout.Header
                        title='users'
                        returnLink={{ slug: '/org', name: 'organization' }}
                    >
                        <h2>{_.first(data)?.meta.total_count || 0} users</h2>
                        {(userOrgPrivileges?.canInviteMember || userOrgPrivileges?.canInviteAdmin) && <Modal.Trigger id='new-user-modal'><h2 className='text-primary cursor-pointer'>new user</h2></Modal.Trigger>}
                    </GlobalLayout.Header>

                    {(orgData && (userOrgPrivileges?.canInviteMember || userOrgPrivileges?.canInviteAdmin)) && <NewUserModal />}

                    <GlobalLayout.Content>
                        {userOrgPrivileges?.canViewUsers && (
                            <InfiniteScroll
                                next={() => setSize(_.last(data).meta.next_page)}
                                hasMore={size != (_.first(data)?.meta?.total_pages || 0)}
                                dataLength={paginatedUsers?.length}
                                loader={<></>}
                            >
                                <div className='list pro'>
                                    {_.map(paginatedUsers, (u, i) => <Item key={i} user={u} orgId={org_id} />)}
                                </div>
                            </InfiniteScroll>
                        )}
                    </GlobalLayout.Content>
                </GlobalLayout>
            </PrivilegeProvider>
        </>
    )
}

const Item = ({ user, orgId }: { user: OrgUser; orgId: number }) => {
    if (!user) return null;
    const { username, first_name, last_name, roles, id } = user;
    return (
        <div className='item' key={id}>
            <div className='space-x-3 tracking-tight lowercase flex'>
                {username && <span className='text-white text-xl sm:text-4xl'>{username}</span>}
                <span className='text-white/40 text-xl sm:text-4xl'>{first_name} {last_name}</span>
                {/* <span className='text-white/40 text-xl'>device</span> */}
            </div>
            <div className='flex items-center gap-3 sm:gap-5 text-primary lowercase'>
                <span>{roles === 'account_owner' ? 'owner' : _.first(roles)?.kind}</span>
                {/* <span className='bg-white/20 h-6 w-6 sm:h-10 sm:w-10 flex items-center justify-center rounded-full text-black'><Minus /></span> */}
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // Fetch organization users
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/users?per_page=30`;
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
            ...data,
        }
    };
};