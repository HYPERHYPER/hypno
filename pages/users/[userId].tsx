import Head from "next/head";
import _ from "lodash";
import useUserStore from "@/store/userStore";
import withAuth from "@/components/hoc/withAuth";
import GlobalLayout from "@/components/GlobalLayout";
import { axiosGetWithToken } from "@/lib/fetchWithToken";
import useSWR from "swr";
import { getOrganizationPrivileges } from "@/helpers/user-privilege";
import { useRouter } from "next/router";
import Spinner from "@/components/Spinner";

function UserProfilePage() {
  const router = useRouter();
  const { query } = router;

  const user = useUserStore.useUser();
  const isHypnoUser = useUserStore.useIsHypnoUser();
  const updateUser = useUserStore.useUpdateUser();
  const token = useUserStore.useToken();

  const userId = query.userId;
  const userProfileUrl = userId
    ? `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/hypno/v1/users/${String(query.userId)}?profile_view=true`
    : null;

  const { data: data, error: error } = useSWR(
    userProfileUrl ? [userProfileUrl, token.access_token] : null,
    ([url, token]) => axiosGetWithToken(url, token),
  );

  if (error) {
    router.push("/404");
  }

  let userData = data?.user;
  let fullName = userData?.first_name + " " + userData?.last_name;
  let username = userData?.username || "no username";
  const isPrimary = userData?.organization?.primary_contact_id === userData?.id;

  const handleClick = (route: string, id: number) => {
    router.push(`/${route}/${id}`);
  };

  return (
    <>
      <Head>
        <title>user profile | hypno™</title>
        <meta
          name="description"
          content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!userData ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <GlobalLayout>
          <GlobalLayout.Header
            title={username}
            //   returnLink={{ slug: '/settings', name: 'settings' }}
          >
            <h2 className="badge badge-primary badge-outline">{userData.id}</h2>
            {userData.username ? (
              <h2 className="badge badge-primary badge-outline">pro</h2>
            ) : (
              <h2 className="badge badge-error badge-outline">unregistered</h2>
            )}
          </GlobalLayout.Header>
          <GlobalLayout.Content>
            <div className="list pro">
              <div className="gap mt-6 flex w-full justify-between">
                <div className="flex gap-3">
                  {userData?.avatar ? (
                    <div className="avatar">
                      <div className="w-20 rounded-full">
                        <img src={userData.avatar} />
                      </div>
                    </div>
                  ) : (
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content w-20 rounded-full">
                        <span className="text-sm">
                          {userData.first_name.charAt(0) +
                            userData.last_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    <div>{fullName}</div>
                    <div>{userData.email}</div>
                  </div>
                </div>
                {isPrimary ? (
                  <svg
                    className="h-20 w-20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="fill-primary"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.3328 4.75102C10.6078 4.44231 11.0815 4.41451 11.3909 4.68891L16.7484 9.44103C16.9085 9.58295 17 9.78638 17 10C17 10.2136 16.9085 10.417 16.7484 10.559L11.3909 15.3111C11.0815 15.5855 10.6078 15.5577 10.3328 15.249C10.0578 14.9403 10.0856 14.4676 10.395 14.1932L14.2793 10.7479H3.74948C3.33555 10.7479 3 10.413 3 10C3 9.58696 3.33555 9.25213 3.74948 9.25213H14.2793L10.395 5.80685C10.0856 5.53244 10.0578 5.05973 10.3328 4.75102Z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-20 w-20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.66723 4.75102C9.39224 4.44231 8.91851 4.41451 8.60914 4.68891L3.25155 9.44103C3.09155 9.58295 3 9.78638 3 10C3 10.2136 3.09155 10.417 3.25155 10.559L8.60914 15.3111C8.91851 15.5855 9.39224 15.5577 9.66723 15.249C9.94223 14.9403 9.91436 14.4676 9.60499 14.1932L5.72074 10.7479H16.2505C16.6644 10.7479 17 10.413 17 10C17 9.58696 16.6644 9.25213 16.2505 9.25213H5.72074L9.60499 5.80685C9.91436 5.53244 9.94223 5.05973 9.66723 4.75102Z"
                      fill="#FFFFFF"
                    ></path>
                  </svg>
                )}
                <div className="flex gap-3">
                  <div className="flex flex-col items-end justify-center">
                    <div
                      onClick={() =>
                        handleClick("organizations", userData.organization.id)
                      }
                      className="cursor-pointer"
                    >
                      {userData.organization.name}
                    </div>
                    {isPrimary ? (
                      <div className="badge badge-primary badge-outline badge-xs">
                        owner
                      </div>
                    ) : (
                      <div className="badge badge-error badge-outline ">
                        member
                      </div>
                    )}
                  </div>
                  <div className="avatar placeholder">
                    <div
                      onClick={() =>
                        handleClick("organizations", userData.organization.id)
                      }
                      className="bg-neutral text-neutral-content w-20 cursor-pointer rounded-full"
                    >
                      <span className="text-sm">
                        {userData.organization.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlobalLayout.Content>
        </GlobalLayout>
      )}
    </>
  );
}

export default withAuth(UserProfilePage, "protected");
