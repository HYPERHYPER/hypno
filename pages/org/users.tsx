import Head from "next/head";
import Link from "next/link";
import _ from "lodash";
import useUserStore from "@/store/userStore";
import withAuth from "@/components/hoc/withAuth";
import GlobalLayout from "@/components/GlobalLayout";
import Modal from "@/components/Modal";
import NewUserModal from "@/components/Users/NewUserModal";
import Minus from "public/pop/minus.svg";
// import { GetServerSideProps } from "next";
// import nookies from "nookies";
import axios from "axios";
import useSWRInfinite from "swr/infinite";
import { axiosGetWithToken, fetchWithToken } from "@/lib/fetchWithToken";
// import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect } from "react";
import {
  // getEventPrivileges,
  getOrganizationPrivileges,
} from "@/helpers/user-privilege";
import {
  // PrivileeContext,
  PrivilegeProvider,
} from "@/components/PrivilegeContext/PrivilegeContext";
import { SaveStatus } from "@/components/Form/AutosaveStatusText";
import useSWR from "swr";

interface Role {
  id: number;
  user_id: number;
  event_id: number;
  organization_id: number | null;
  created_at: string;
  updated_at: string;
  authorizer_id: number;
  kind: string;
  status: string;
}

interface OrgUser {
  id: number | null;
  username: string | null;
  organization_id: number | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  created_at: string | null;
  roles: Role[] | string | null;
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

export default withAuth(OrganizationUsersPage, "protected");
function OrganizationUsersPage(props: ResponseData) {
  const user = useUserStore.useUser();
  const org_id = user.organization.id;
  const token = useUserStore.useToken();

  const orgUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${org_id}`;
  const {
    data: orgData,
    isValidating: isValidatingOrgData,
    error: orgError,
  } = useSWR([orgUrl, token.access_token], ([url, token]) =>
    axiosGetWithToken(url, token),
  );

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && pageIndex == previousPageData.pages) return null; // reached the end
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/users?per_page=30`;
    if (pageIndex === 0) return [url, token.access_token];
    const pageIdx = previousPageData.meta.next_page;
    return [`${url}&page=${pageIdx}`, token.access_token];
  };

  const { data, size, setSize, error, isValidating } = useSWRInfinite(
    getKey,
    ([url, token]) => axiosGetWithToken(url, token),
  );

  const [paginatedUsers, setPaginatedUsers] = useState<OrgUser[]>([]);

  useEffect(() => {
    if (data) {
      setPaginatedUsers(_.map(data, (v) => v.users).flat());
    }
  }, [data]);

  const removeUser = (email: string) => {
    setPaginatedUsers((prevUsers) =>
      prevUsers.filter((user) => user.email !== email),
    );
  };

  const userOrgPrivileges = orgData
    ? getOrganizationPrivileges(orgData.organization.user_privileges)
    : null;

  return (
    <>
      <Head>
        <title>organization users | hypno™</title>
        <meta
          name="description"
          content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PrivilegeProvider privileges={userOrgPrivileges}>
        <GlobalLayout>
          <GlobalLayout.Header
            title="users"
            returnLink={{ slug: "/org", name: "organization" }}
          >
            <h2>{_.first(data)?.meta.total_count || 0} users</h2>
            {(userOrgPrivileges?.canInviteMember ||
              userOrgPrivileges?.canInviteAdmin) && (
              <Modal.Trigger id="new-user-modal">
                <h2 className="text-primary cursor-pointer">new user</h2>
              </Modal.Trigger>
            )}
          </GlobalLayout.Header>

          {orgData &&
            (userOrgPrivileges?.canInviteMember ||
              userOrgPrivileges?.canInviteAdmin) && <NewUserModal />}

          <GlobalLayout.Content>
            {userOrgPrivileges?.canViewUsers && (
              // <InfiniteScroll
              //   next={() => setSize(_.last(data).meta.next_page)}
              //   hasMore={size != (_.first(data)?.meta?.total_pages || 0)}
              //   dataLength={paginatedUsers?.length}
              //   loader={<></>}
              // >
              <div className="list pro">
                {_.map(paginatedUsers, (u, i) => (
                  <Item
                    key={i}
                    user={u}
                    orgId={org_id}
                    token={token}
                    removeUser={removeUser}
                  />
                ))}
              </div>
              // </InfiniteScroll>
            )}
          </GlobalLayout.Content>
        </GlobalLayout>
      </PrivilegeProvider>
    </>
  );
}

const Item = ({
  user,
  orgId,
  token,
  removeUser,
}: {
  user: OrgUser;
  orgId: number;
  token: any;
  removeUser: (email: string) => void;
}) => {
  const nullUser = {
    id: null,
    username: null,
    organization_id: null,
    email: null,
    first_name: null,
    last_name: null,
    avatar: null,
    created_at: null,
    roles: null,
  };
  const [status, setStatus] = useState<SaveStatus>("ready");
  const [selectedUserData, setSelectedUserData] = useState<OrgUser>(nullUser);

  if (!user) return null;
  const { username, email, roles, id } = user;

  const handleModalOpen = (user: OrgUser) => {
    setSelectedUserData(user);
  };

  const handleModalClose = () => {
    setSelectedUserData(nullUser);
    (document.getElementById("kick-user-modal") as HTMLInputElement).checked =
      false;
  };

  const kickUser = async (orgId: number, email: string) => {
    setStatus("saving");

    if (!selectedUserData.id) {
      setStatus("error");
      return;
    }

    let payload = {
      permission: {
        organization_id: orgId,
        email,
      },
    };

    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/users/kick_user`;
    await axios
      .put(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.access_token,
        },
      })
      .then((res) => {
        setStatus("success");
        removeUser(selectedUserData.email as string);
        setTimeout(() => {
          handleModalClose();
          setStatus("ready");
        }, 2000);
      })
      .catch((e) => {
        console.log(e);
        setStatus("error");
        setTimeout(() => {
          (
            document.getElementById("kick-user-modal") as HTMLInputElement
          ).checked = false;
          setStatus("ready");
        }, 3000);
      });
  };

  const userModalContent = (user: OrgUser) => (
    <div className="user-details p-4 bg-black-800 rounded-lg text-white">
      <p className="text-lg font-semibold">
        Username: <span className="font-normal">{user.username}</span>
      </p>
      <p className="text-lg font-semibold">
        Email: <span className="font-normal">{user.email}</span>
      </p>
      <br />
      <p className="text-md">Will be removed from:</p>
      <ul className="mt-2 space-y-2">
        {Array.isArray(user.roles) &&
          user.roles.map((role, i) => (
            <Link
              key={i}
              href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/e/${role.event_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              Event: {role.event_id} →
            </Link>
          ))}
      </ul>
    </div>
  );

  return (
    <>
      <div className="item" key={id}>
        <div className="sm:space-x-3 tracking-tight lowercase flex flex-col sm:flex-row">
          {username && (
            <span className="text-white sm:text-3xl">{username}</span>
          )}
          <span className="text-white/40 sm:text-3xl">{email}</span>
          {/* <span className='text-white/40 text-xl'>device</span> */}
        </div>
        <div className="flex items-center gap-2 sm:gap-5 text-primary lowercase">
          <span>
            {roles === "account_owner"
              ? "owner"
              : Array.isArray(roles)
                ? _.first(roles)?.kind
                : null}
          </span>
          {roles !== "account_owner" && Array.isArray(roles) && (
            <Modal.Trigger
              id="kick-user-modal"
              onClick={() => handleModalOpen(user)}
            >
              <span className="bg-white/20 h-5 w-5 sm:h-10 sm:w-10 flex items-center justify-center rounded-full text-black">
                <Minus />
              </span>
            </Modal.Trigger>
          )}
        </div>
      </div>

      {/* MODAL */}
      <Modal
        id="kick-user-modal"
        title="Remove User"
        actionBtn={{
          status,
          text: "Confirm",
          onClick: () => kickUser(orgId, email as string),
        }}
      >
        {userModalContent(selectedUserData)}
      </Modal>
      {/* MODAL END */}
    </>
  );
};
