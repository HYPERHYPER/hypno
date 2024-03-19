import Head from "next/head";
import _, { debounce } from "lodash";
import useUserStore from "@/store/userStore";
import withAuth from "@/components/hoc/withAuth";
import GlobalLayout from "@/components/GlobalLayout";
import Link from "next/link";
import Modal from "@/components/Modal";
import FormControl from "@/components/Form/FormControl";
import { GetServerSideProps } from "next";
import axios from "axios";
import nookies from "nookies";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AutosaveStatusText,
  SaveStatus,
} from "@/components/Form/AutosaveStatusText";
import { axiosGetWithToken } from "@/lib/fetchWithToken";
import useSWR from "swr";
import { getOrganizationPrivileges } from "@/helpers/user-privilege";
import { useRouter } from "next/router";
import Spinner from "@/components/Spinner";

interface ResponseData {
  user_count: number;
}

function OrganizationProfilePage(props: ResponseData) {
  const router = useRouter();
  const { query } = router;

  const user = useUserStore.useUser();
  const isHypnoUser = useUserStore.useIsHypnoUser();
  const updateUser = useUserStore.useUpdateUser();
  const token = useUserStore.useToken();

  const orgUrl = `${
    process.env.NEXT_PUBLIC_API_BASE_URL
  }/hypno/v1/organizations/${String(query.organizationId)}?profile_view=true`;

  const {
    data: data,
    isValidating: isValidatingOrgData,
    error: orgError,
  } = useSWR(
    [orgUrl, token.access_token],
    ([url, token]) => axiosGetWithToken(url, token),
    { revalidateOnMount: false },
  );

  // Access data and render UI based on data
  const orgData = data?.organization;
  const eventUsers = orgData?.event_users;
  const orgUsers = orgData?.organization_users;
  const nonProUsers = orgData?.non_pro_users;
  const owner = orgData?.owner;
  const events = orgData?.events;
  const stats = orgData?.statistics;

  let totalUsers = null;
  if (orgData) {
    totalUsers = { ...eventUsers, ...orgUsers };
    console.log("np users", stats);
  }
  //   console.log(
  //     'here',
  //     Object.keys(eventUsers).map((user) => eventUsers[user])
  //   );
  //   console.log(query.organizationId)

  //   const userUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/users?per_page=1`;
  //   const {
  //     data: userData,
  //     isValidating: isValidatingUserData,
  //     error: userError,
  //   } = useSWR([userUrl, token.access_token], ([url, token]) =>
  //     axiosGetWithToken(url, token)
  //   );
  //   //@ts-ignore
  //   const userCount = userData?.meta?.total_count || 0;

  //   const [saveStatus, setSaveStatus] = useState<SaveStatus>('ready');
  //   const {
  //     register,
  //     handleSubmit,
  //     formState: { isDirty, errors },
  //     reset,
  //   } = useForm({
  //     defaultValues: {
  //       name: orgData.name || '',
  //     },
  //   });

  //   const updateOrganizationName = async (data: any) => {
  //     if (!_.isEmpty(errors)) {
  //       console.log('submitForm errors', { errors });
  //       setSaveStatus('error');
  //       return;
  //     }

  //     /* Update user payload */
  //     let payload = {
  //       organization: {
  //         ...data,
  //       },
  //     };

  //     const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${organization.id}`;
  //     await axios
  //       .put(url, payload, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: 'Bearer ' + token.access_token,
  //         },
  //       })
  //       .then((res) => {
  //         setSaveStatus('success');
  //         setTimeout(() => {
  //           setSaveStatus('ready');
  //         }, 3000);
  //         updateUser({
  //           organization: {
  //             ...data,
  //           },
  //         });
  //         reset(data);
  //       })
  //       .catch((e) => {
  //         console.log(e);
  //         setSaveStatus('error');
  //       });
  //   };

  //   const debouncedSave = useCallback(
  //     debounce(() => {
  //       handleSubmit(updateOrganizationName)();
  //       return;
  //     }, 1000),
  //     []
  //   );

  //   useEffect(() => {
  //     if (isDirty) {
  //       setSaveStatus('saving');
  //       debouncedSave();
  //     }
  //   }, [isDirty]);

  //   const userOrgPrivileges = orgData
  //     ? getOrganizationPrivileges(orgData.user_privileges)
  //     : null;

  const handleClick = (route: string, id: number) => {
    router.push(`/${route}/${id}`);
  };

  return (
    <>
      <Head>
        <title>organization profile | hypno™</title>
        <meta
          name="description"
          content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!orgData ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <GlobalLayout>
          <GlobalLayout.Header
            title={orgData.name}
            //   returnLink={{ slug: '/settings', name: 'settings' }}
          >
            <h2 className="badge badge-primary badge-outline">{orgData.id}</h2>
            {!owner && (
              <h2 className="badge badge-error badge-outline">no owner</h2>
            )}
          </GlobalLayout.Header>
          <GlobalLayout.Content>
            <div className="list pro">
              <div className="collapse-arrow bg-base-200 collapse">
                <input type="radio" name="my-accordion-2" defaultChecked />
                <div className="collapse-title text-xl font-medium">
                  Billable Users
                </div>
                <div className="collapse-content">
                  <div className="stats flex w-full flex-grow shadow">
                    <div className="stat">
                      {/* <div className="stat-figure text-secondary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="inline-block h-8 w-8 stroke-current"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      </div> */}
                      <div className="stat-title">Guests</div>
                      <div className="stat-value">
                        {Object.keys(eventUsers).length}
                      </div>
                      {/* <div className="stat-desc">Jan 1st - Feb 1st</div> */}
                    </div>

                    <div className="stat">
                      {/* <div className="stat-figure text-secondary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="inline-block h-8 w-8 stroke-current"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          ></path>
                        </svg>
                      </div> */}
                      <div className="stat-title">Members</div>
                      <div className="stat-value">
                        {
                          Object.keys(orgUsers).filter(
                            (u) => orgUsers[u][0].kind == "member",
                          ).length
                        }
                      </div>
                      {/* <div className="stat-desc">↗︎ 400 (22%)</div> */}
                    </div>

                    <div className="stat">
                      {/* <div className="stat-figure text-secondary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="inline-block h-8 w-8 stroke-current"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                          ></path>
                        </svg>
                      </div> */}
                      <div className="stat-title">Admins</div>
                      <div className="stat-value">
                        {
                          Object.keys(orgUsers).filter(
                            (u) => orgUsers[u][0].kind == "admin",
                          ).length
                        }
                      </div>
                      {/* <div className="stat-desc">↘︎ 90 (14%)</div> */}
                    </div>
                  </div>{" "}
                  <div className="divider"></div>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Permission</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {owner && (
                          <tr
                            id="account_owner"
                            className="hover:bg-neutral-800"
                          >
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="flex gap-2">
                                  {owner?.avatar ? (
                                    <div className="avatar">
                                      <div
                                        onClick={() =>
                                          handleClick("users", owner.id)
                                        }
                                        className="ring-primary ring-offset-base-100 w-10 cursor-pointer rounded-full ring ring-offset-2"
                                      >
                                        <img src={owner.avatar} />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="avatar placeholder">
                                      <div
                                        onClick={() =>
                                          handleClick("users", owner.id)
                                        }
                                        className="bg-neutral text-neutral-content w-10 cursor-pointer rounded-full"
                                      >
                                        <span className="text-sm">
                                          {owner.first_name.charAt(0) +
                                            owner.last_name.charAt(0)}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <div
                                      onClick={() =>
                                        handleClick("users", owner.id)
                                      }
                                      className="cursor-pointer font-bold"
                                    >
                                      {owner.email}
                                    </div>
                                    <div
                                      onClick={() =>
                                        handleClick("users", owner.id)
                                      }
                                      className="cursor-pointer text-sm opacity-50"
                                    >
                                      {owner.first_name +
                                        " " +
                                        owner.last_name +
                                        " - " +
                                        owner.username}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="badge badge-primary">owner</div>
                            </td>
                            <td>{owner.created_at.split("T")[0]}</td>
                            <th>
                              <button className="btn btn-sm hover:btn-info rounded-full">
                                {/* <svg
                                  className="h-2 w-2"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M5.05024 13.8891C4.75734 14.182 4.75734 14.6568 5.05024 14.9497C5.34313 15.2426 5.818 15.2426 6.1109 14.9497L10 11.0606L13.8891 14.9497C14.182 15.2426 14.6569 15.2426 14.9498 14.9497C15.2427 14.6568 15.2427 14.182 14.9498 13.8891L11.0607 9.99996L14.9497 6.1109C15.2426 5.818 15.2426 5.34313 14.9497 5.05024C14.6568 4.75734 14.182 4.75734 13.8891 5.05024L10 8.9393L6.11095 5.05024C5.81805 4.75734 5.34318 4.75734 5.05029 5.05024C4.75739 5.34313 4.75739 5.818 5.05029 6.1109L8.93935 9.99996L5.05024 13.8891Z"
                                    fill="#FFFFFF"
                                  ></path>
                                </svg> */}
                                <svg
                                  viewBox="0 0 20 20"
                                  width={20}
                                  height={20}
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="#00FF99"
                                >
                                  <path
                                    d="M9 15C9 14.4477 9.44771 14 10 14C10.5523 14 11 14.4477 11 15C11 15.5523 10.5523 16 10 16C9.44771 16 9 15.5523 9 15Z"
                                    fill="#00FF99"
                                  ></path>
                                  <path
                                    d="M9 10.0001C9 9.44778 9.44772 9.00006 10 9.00006C10.5523 9.00006 11 9.44778 11 10.0001C11 10.5523 10.5523 11.0001 10 11.0001C9.44771 11.0001 9 10.5523 9 10.0001Z"
                                    fill="#00FF99"
                                  ></path>
                                  <path
                                    d="M9 5C9 4.44772 9.44772 4 10 4C10.5523 4 11 4.44772 11 5C11 5.55228 10.5523 6 10 6C9.44772 6 9 5.55228 9 5Z"
                                    fill="#00FF99"
                                  ></path>
                                </svg>{" "}
                              </button>
                            </th>
                          </tr>
                        )}
                        {totalUsers &&
                          Object.keys(totalUsers).map((userInfo, i) => (
                            <tr
                              key={userInfo + i}
                              className="hover:bg-neutral-800"
                            >
                              <td>
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div
                                      onClick={() =>
                                        handleClick(
                                          "users",
                                          totalUsers[userInfo][0].user_id,
                                        )
                                      }
                                      className="cursor-pointer font-bold"
                                    >
                                      {userInfo.split("-")[0]}
                                    </div>
                                    <div
                                      onClick={() =>
                                        handleClick(
                                          "users",
                                          totalUsers[userInfo][0].user_id,
                                        )
                                      }
                                      className="cursor-pointer text-sm opacity-50"
                                    >
                                      {userInfo.split("-")[1]}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {totalUsers[userInfo][0].event_id ? (
                                  <div className="badge badge-white badge-outline">
                                    guest: {totalUsers[userInfo][0].event_id}
                                  </div>
                                ) : (
                                  <div className="badge badge-primary badge-outline">
                                    {totalUsers[userInfo][0].kind}
                                  </div>
                                )}
                              </td>
                              <td>
                                {
                                  totalUsers[userInfo][0].created_at.split(
                                    "T",
                                  )[0]
                                }
                              </td>
                              <th>
                                <button className="btn btn-sm hover:btn-info rounded-full">
                                  <svg
                                    viewBox="0 0 20 20"
                                    width={20}
                                    height={20}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#00FF99"
                                  >
                                    <path
                                      d="M9 15C9 14.4477 9.44771 14 10 14C10.5523 14 11 14.4477 11 15C11 15.5523 10.5523 16 10 16C9.44771 16 9 15.5523 9 15Z"
                                      fill="#00FF99"
                                    ></path>
                                    <path
                                      d="M9 10.0001C9 9.44778 9.44772 9.00006 10 9.00006C10.5523 9.00006 11 9.44778 11 10.0001C11 10.5523 10.5523 11.0001 10 11.0001C9.44771 11.0001 9 10.5523 9 10.0001Z"
                                      fill="#00FF99"
                                    ></path>
                                    <path
                                      d="M9 5C9 4.44772 9.44772 4 10 4C10.5523 4 11 4.44772 11 5C11 5.55228 10.5523 6 10 6C9.44772 6 9 5.55228 9 5Z"
                                      fill="#00FF99"
                                    ></path>
                                  </svg>{" "}
                                </button>
                              </th>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="collapse-arrow bg-base-200 collapse">
                <input type="radio" name="my-accordion-2" />
                <div className="collapse-title text-xl font-medium">Events</div>
                <div className="collapse-content">
                  <div className="stats flex flex-grow shadow">
                    <div className="stat">
                      <div className="stat-title">Total</div>
                      <div className="stat-value">{stats.total_events}</div>
                      <div className="stat-desc">{stats.event_date_range}</div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">Uploads</div>
                      <div className="stat-value">
                        {stats.total_photos.toLocaleString()}
                      </div>
                      {/* <div className="stat-desc">↗︎ 400 (22%)</div> */}
                    </div>

                    <div className="stat">
                      <div className="stat-title">Most Uploaded</div>
                      {stats.best_event.event_name ? (
                        <>
                          <div className="stat-value">
                            {stats.best_event.event_name}
                          </div>
                          <div className="stat-desc">
                            <div className="badge badge-primary badge-outline">
                              {stats.best_event.event_id}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="stat-value">n/a</div>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Uploads</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events &&
                          events.map((event) => (
                            <tr
                              key={event.id}
                              className="hover:bg-neutral-800"
                              onClick={() => handleClick("e", event.id)}
                            >
                              <td>
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="badge badge-primary badge-outline">
                                      {event.id}
                                    </div>
                                    {/* <div className="text-sm opacity-50">
                                    {userInfo.split("-")[1]}
                                  </div> */}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div
                                  onClick={() => handleClick("e", event.id)}
                                  className="cursor-pointer text-lg"
                                >
                                  {event.name}
                                </div>
                              </td>
                              <td>
                                <div className="badge badge-white badge-outline">
                                  {event.event_type == "hypno"
                                    ? "iPad"
                                    : "iPhone"}
                                </div>
                              </td>
                              <td>
                                <div className="">{event.uploads}</div>
                              </td>
                              <th>
                                <button className="btn btn-sm hover:btn-info rounded-full">
                                  <svg
                                    viewBox="0 0 20 20"
                                    width={20}
                                    height={20}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#00FF99"
                                  >
                                    <path
                                      d="M9 15C9 14.4477 9.44771 14 10 14C10.5523 14 11 14.4477 11 15C11 15.5523 10.5523 16 10 16C9.44771 16 9 15.5523 9 15Z"
                                      fill="#00FF99"
                                    ></path>
                                    <path
                                      d="M9 10.0001C9 9.44778 9.44772 9.00006 10 9.00006C10.5523 9.00006 11 9.44778 11 10.0001C11 10.5523 10.5523 11.0001 10 11.0001C9.44771 11.0001 9 10.5523 9 10.0001Z"
                                      fill="#00FF99"
                                    ></path>
                                    <path
                                      d="M9 5C9 4.44772 9.44772 4 10 4C10.5523 4 11 4.44772 11 5C11 5.55228 10.5523 6 10 6C9.44772 6 9 5.55228 9 5Z"
                                      fill="#00FF99"
                                    ></path>
                                  </svg>{" "}
                                </button>
                              </th>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="collapse-arrow bg-base-200 collapse">
                <input type="radio" name="my-accordion-2" />
                <div className="collapse-title text-xl font-medium">
                  Non Pro Users
                </div>
                <div className="collapse-content">
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nonProUsers &&
                          nonProUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-neutral-800">
                              <td>
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="badge badge-primary badge-outline">
                                      {user.id}
                                    </div>
                                    {/* <div className="text-sm opacity-50">
                                  {userInfo.split("-")[1]}
                                </div> */}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div
                                  onClick={() => handleClick("users", user.id)}
                                  className="cursor-pointer text-lg"
                                >
                                  {user.email}
                                </div>
                              </td>
                              <th>
                                <button className="btn btn-sm hover:btn-info rounded-full">
                                  <svg
                                    viewBox="0 0 20 20"
                                    width={20}
                                    height={20}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#00FF99"
                                  >
                                    <path
                                      d="M9 15C9 14.4477 9.44771 14 10 14C10.5523 14 11 14.4477 11 15C11 15.5523 10.5523 16 10 16C9.44771 16 9 15.5523 9 15Z"
                                      fill="#00FF99"
                                    ></path>
                                    <path
                                      d="M9 10.0001C9 9.44778 9.44772 9.00006 10 9.00006C10.5523 9.00006 11 9.44778 11 10.0001C11 10.5523 10.5523 11.0001 10 11.0001C9.44771 11.0001 9 10.5523 9 10.0001Z"
                                      fill="#00FF99"
                                    ></path>
                                    <path
                                      d="M9 5C9 4.44772 9.44772 4 10 4C10.5523 4 11 4.44772 11 5C11 5.55228 10.5523 6 10 6C9.44772 6 9 5.55228 9 5Z"
                                      fill="#00FF99"
                                    ></path>
                                  </svg>{" "}
                                </button>
                              </th>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </GlobalLayout.Content>

          {/* <Modal
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
        </Modal> */}
        </GlobalLayout>
      )}
    </>
  );
}

const Item = ({
  name,
  value,
  href,
}: {
  name: string;
  value: string;
  href?: string;
}) => {
  return (
    <div className="item">
      <span className="text-white/40">{name}</span>
      <span className="text-primary lowercase">
        {href ? <Link href={href}>{value} →</Link> : value}
      </span>
    </div>
  );
};

export default withAuth(OrganizationProfilePage, "protected");
