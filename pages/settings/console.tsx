import Head from "next/head";
import withAuth from "@/components/hoc/withAuth";
import GlobalLayout from "@/components/GlobalLayout";
import AddUser from "public/pop/person-plus.svg";
import { Organization } from "@/types/organizations";
import GlobalInvite from "@/components/Form/Console/GlobalInvite";
import CustomCheckout from "@/components/Form/Console/CustomCheckout";

const HypnoConsole = () => {
  return (
    <>
      <Head>
        <title>console | hypno™</title>
        <meta
          name="description"
          content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GlobalLayout>
        <GlobalLayout.Header
          title="hypno console"
          returnLink={{ slug: "/settings", name: "settings" }}
        >
          <h2>hypno-only console</h2>
        </GlobalLayout.Header>

        {/* {(orgData && (userOrgPrivileges?.canInviteMember || userOrgPrivileges?.canInviteAdmin)) && <NewUserModal />} */}

        <GlobalLayout.Content>
          <div className="collapse bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              Global Invite
            </div>
            <div className="collapse-content">
              <GlobalInvite />
            </div>
          </div>

          <div className="collapse bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              Custom Checkout
            </div>
            <div className="collapse-content">
              <CustomCheckout />
            </div>
          </div>
        </GlobalLayout.Content>
      </GlobalLayout>
    </>
  );
};

const Item = ({ organization }: { organization: Organization }) => {
  if (!organization) return null;
  const { id, name, metadata } = organization;
  return (
    <div className="item">
      <div className="space-x-3 tracking-tight lowercase flex">
        {name && <span className="text-white text-xl sm:text-4xl">{name}</span>}
        {metadata?.hypno_pro && (
          <span className="text-white/40 text-xl sm:text-4xl">
            {metadata.hypno_pro.current_tier}
          </span>
        )}
        {/* <span className='text-white/40 text-xl'>device</span> */}
      </div>
      <div className="flex items-center gap-3 sm:gap-5 text-primary lowercase">
        {/* <span>{roles === 'account_owner' ? 'owner' : _.first(roles)?.kind}</span> */}
        <button className="p-4">
          <div className="sm:icon">
            <AddUser />
          </div>
        </button>
      </div>
    </div>
  );
};

export default withAuth(HypnoConsole, "hypno");
