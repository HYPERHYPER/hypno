import Head from "next/head";
import _ from "lodash";
import useUserStore from "@/store/userStore";
import withAuth from "@/components/hoc/withAuth";
import GlobalLayout from "@/components/GlobalLayout";
import { axiosGetWithToken } from "@/lib/fetchWithToken";
import useSWR from "swr";
import axios from "axios";
import { useRouter } from "next/router";
import Spinner from "@/components/Spinner";
import { useState } from "react";

interface SimpleEventData {
  id: number;
  name: string;
  event_type: string;
  uploads: number;
}

interface NonProUserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface UserPermissionData {
  id: number;
  user_id: number;
  event_id: number | null;
  organization_id: number | null;
  created_at: string;
  updated_at: string;
  authorizer_id: number;
  kind: string;
  status: string;
}

interface TotalUsers {
  [key: string]: UserPermissionData[];
}

interface DaisyUIModalElement extends HTMLElement {
  close: () => void;
  showModal: () => void;
}

function OrganizationProfilePage() {
  const router = useRouter();
  const { query } = router;

  const user = useUserStore.useUser();
  const isHypnoUser = useUserStore.useIsHypnoUser();
  const updateUser = useUserStore.useUpdateUser();
  const token = useUserStore.useToken();

  const [selectedUserData, setSelectedUserData] = useState({
    event_id: null,
    user_id: null,
    organization_id: null,
    kind: null,
    status: null,
    email: null,
    id: null,
  });

  const [status, setStatus] = useState("ready");

  const organizationId = query.organizationId;
  const orgUrl = organizationId
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${String(organizationId)}?profile_view=true`
    : null;

  const { data: data, error: error } = useSWR(
    orgUrl ? [orgUrl, token.access_token] : null,
    ([url, token]) => axiosGetWithToken(url, token),
  );

  if (error) {
    router.push("/404");
  }

  const orgData = data?.organization;
  const eventUsers = orgData?.event_users;
  const orgUsers = orgData?.organization_users;
  const nonProUsers = orgData?.non_pro_users;
  const owner = orgData?.owner;
  const events = orgData?.events;
  const stats = orgData?.statistics;
  const tier = orgData?.metadata?.hypno_pro?.sub_type || "free";

  let totalUsers: any = null;
  if (orgData) {
    totalUsers = { ...eventUsers, ...orgUsers };
    console.log("total", totalUsers);
  }

  const handleClick = (route: string, id: number) => {
    router.push(`/${route}/${id}`);
  };

  const handleModalOpen = (userData: any, userInfo) => {
    let userPermission = { ...userData, email: userInfo.split("-")[0] };
    setSelectedUserData(userPermission);
    (
      document.getElementById(
        "updateUserPermissionModal",
      ) as DaisyUIModalElement
    ).showModal();
    console.log(userPermission);
  };

  const kickGuestUser = async (guestPermission: any) => {
    setStatus("saving");

    if (!selectedUserData.user_id) {
      setStatus("error");
      return;
    }

    let payload = {
      permission: guestPermission,
    };

    console.log("payload", payload);

    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/users/kick_guest_user`;
    await axios
      .put(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.access_token,
        },
      })
      .then((res) => {
        console.log("result", res);
        setStatus("success");
        setTimeout(() => {
          (
            document.getElementById(
              "updateUserPermissionModal",
            ) as DaisyUIModalElement
          ).close();
          setStatus("ready");
        }, 2000);
      })
      .catch((e) => {
        console.log(e);
        setStatus("error");
        setTimeout(() => {
          (
            document.getElementById(
              "updateUserPermissionModal",
            ) as DaisyUIModalElement
          ).close();
          setStatus("ready");
        }, 3000);
      });
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
          <GlobalLayout.Header title={orgData.name}>
            <h2 className="badge badge-primary badge-outline">{orgData.id}</h2>
            <h2 className="badge badge-primary badge-outline">{tier}</h2>
            {!owner && (
              <h2 className="badge badge-error badge-outline">no owner</h2>
            )}
          </GlobalLayout.Header>
          <GlobalLayout.Content>
            <div className="list pro">
              <div tabIndex={0} className="collapse-open bg-base-200 collapse">
                <div className="collapse-title text-xl font-medium">
                  Billable Users
                </div>
                <div className="collapse-content">
                  <div className="stats flex w-full flex-grow shadow">
                    <div className="stat">
                      <div className="stat-title">Guests</div>
                      <div className="stat-value">
                        {Object.keys(eventUsers).length}
                      </div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">Members</div>
                      <div className="stat-value">
                        {
                          Object.keys(orgUsers).filter(
                            (u) => orgUsers[u][0].kind == "member",
                          ).length
                        }
                      </div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">Admins</div>
                      <div className="stat-value">
                        {
                          Object.keys(orgUsers).filter(
                            (u) => orgUsers[u][0].kind == "admin",
                          ).length
                        }
                      </div>
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
                              <div className="dropdown dropdown-left">
                                <div
                                  tabIndex={0}
                                  role="button"
                                  className="btn btn-sm hover:btn-info rounded-full"
                                >
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
                                </div>
                                <ul
                                  tabIndex={0}
                                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                                >
                                  <li>
                                    <p>n/a</p>
                                  </li>
                                </ul>
                              </div>
                            </th>
                          </tr>
                        )}
                        {totalUsers &&
                          Object.keys(totalUsers as TotalUsers).map(
                            (userInfo, i) => (
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
                                  <div className="flex gap-2">
                                    {totalUsers[userInfo][0].event_id ? (
                                      totalUsers[userInfo].map(
                                        (
                                          userData: UserPermissionData,
                                          i: number,
                                        ) => (
                                          <div
                                            key={i}
                                            className="badge badge-white badge-outline"
                                          >
                                            guest: {userData.event_id}
                                          </div>
                                        ),
                                      )
                                    ) : (
                                      <div className="badge badge-primary badge-outline">
                                        {totalUsers[userInfo][0].kind}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  {
                                    totalUsers[userInfo][0].created_at.split(
                                      "T",
                                    )[0]
                                  }
                                </td>
                                <th>
                                  <div className="dropdown dropdown-left">
                                    <div
                                      tabIndex={0}
                                      role="button"
                                      className="btn btn-sm hover:btn-info rounded-full"
                                    >
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
                                    </div>
                                    <ul
                                      tabIndex={0}
                                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-fit gap-2"
                                    >
                                      <li>
                                        {totalUsers[userInfo].map((up) => (
                                          <button
                                            key={up.id}
                                            className="btn btn-sm btn-error text-xs rounded-md m-1"
                                            onClick={() =>
                                              handleModalOpen(up, userInfo)
                                            }
                                          >
                                            {up.event_id
                                              ? `remove guest: ${up.event_id}`
                                              : `remove ${up.kind}`}
                                          </button>
                                        ))}
                                      </li>
                                    </ul>
                                  </div>
                                </th>
                              </tr>
                            ),
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div tabIndex={0} className="collapse-open bg-base-200 collapse">
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
                          events.map((event: SimpleEventData) => (
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

              <div tabIndex={0} className="collapse-open bg-base-200 collapse">
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
                          nonProUsers.map((user: NonProUserData) => (
                            <tr key={user.id} className="hover:bg-neutral-800">
                              <td>
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="badge badge-primary badge-outline">
                                      {user.id}
                                    </div>
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
            {/* MODAL */}
            <dialog id="updateUserPermissionModal" className="modal">
              <div className="modal-box border border-info">
                <h3 className="font-bold text-lg">Remove Permission</h3>
                <p className="py-4">
                  {`are you sure you want to disable ${selectedUserData.event_id ? `guest access in event: ${selectedUserData.event_id}` : `${selectedUserData.kind} access`} for ${selectedUserData.email}?`}
                </p>
                <div className="modal-action">
                  <button
                    className={
                      status === "ready"
                        ? "btn btn-primary rounded-md"
                        : "btn btn-primary rounded-md btn-disabled"
                    }
                    onClick={() =>
                      kickGuestUser({
                        user_id: selectedUserData.user_id,
                        event_id: selectedUserData.event_id,
                      })
                    }
                  >
                    {status === "ready" && "Confirm"}
                    {status === "saving" && "Saving..."}
                    {status === "success" && "Success!"}
                    {status === "error" && "Error!"}
                  </button>
                  <form method="dialog">
                    <button className="btn border-error rounded-md">
                      Close
                    </button>
                  </form>
                </div>
              </div>
            </dialog>
            {/* MODAL END */}
          </GlobalLayout.Content>
        </GlobalLayout>
      )}
    </>
  );
}

export default withAuth(OrganizationProfilePage, "protected");
