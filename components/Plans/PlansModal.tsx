import { axiosGetWithToken } from "@/lib/fetchWithToken";
import useUserStore from "@/store/userStore";
import axios from "axios";
import clsx from "clsx";
import _ from "lodash";
import Checkmark from "public/pop/checkmark.svg";
import Minus from "public/pop/minus.svg";
import { useCallback, useState } from "react";
import useSWR from "swr";

interface FeatureAccess {
  [key: string]: Array<string>;
}
const FEATURE_ACCESS: FeatureAccess = {
  camera: ["free", "creator", "studio", "brand"],
  filters: ["free", "creator", "studio", "brand"],
  graphics: ["creator", "studio", "brand"],
  effects: ["creator", "studio", "brand"],
  "canon connect": ["studio", "brand"],
  gallery: ["free", "creator", "studio", "brand"],
  branding: ["creator", "studio", "brand"],
  "data capture": ["brand"],
  "custom legal": ["brand"],
  // "your domain": ["brand"],
  // "api access": ["brand"],
  "live support": ["studio", "brand"],
  "studio services": ["studio", "brand"],
  "hypno community": ["studio", "brand"],
};

const FEATURES = [
  {
    shoot: ["camera", "filters", "graphics", "effects", "canon connect"],
  },
  {
    share: [
      "gallery",
      "branding",
      "data capture",
      "custom legal",
      // "your domain",
      // "api access",
    ],
  },
];

interface PlanType {
  [key: string]: any;
}
const PLAN_TYPES: PlanType = {
  free: {
    tagline: "shoot + share",
    highlights: ["shoot + share in seconds", "add collaborators for free", "100 photo limit"],
    annualPrice: 0,
    monthlyPrice: 0,
    users: 1,
    additionalPrice: 0,
    uploads: 100,
  },
  creator: {
    tagline: "endless creativity",
    highlights: ["style your photos + galleries", "add collaborators from $9/mo", "unlimited photos"],
    icon: '∞',
    annualPrice: 9,
    monthlyPrice: 15,
    users: 1,
    additionalPrice: 9,
    uploads: "unlimited",
  },
  studio: {
    tagline: "canon capture",
    highlights: ["connect your professional camera", "add collaborators from $99/mo", "unlimited photos"],
    icon: '✶',
    annualPrice: 99,
    monthlyPrice: 125,
    users: 1,
    additionalPrice: 99,
    uploads: "unlimited",
  },
  brand: {
    tagline: "enterprise data/legal",
    highlights: ["unlock data capture + custom legal", "add collaborators from $999/mo", "unlimited photos"],
    icon: '✺',
    annualPrice: 999,
    monthlyPrice: 1250,
    users: 1,
    additionalPrice: 999,
    uploads: "unlimited",
  },
};

// const CREATOR_PLAN = process.env.NEXT_PUBLIC_CREATOR_PLAN
// const CREATOR_PLAN_DISCOUNTED = process.env.NEXT_PUBLIC_CREATOR_PLAN_DISCOUNTED

// const STUDIO_PLAN = process.env.NEXT_PUBLIC_STUDIO_PLAN
// const STUDIO_PLAN_DISCOUNTED = process.env.NEXT_PUBLIC_STUDIO_PLAN_DISCOUNTED

// const BRAND_PLAN = process.env.NEXT_PUBLIC_BRAND_PLAN
// const BRAND_PLAN_DISCOUNTED = process.env.NEXT_PUBLIC_BRAND_PLAN_DISCOUNTED

const CREATOR_MONTHLY = process.env.NEXT_PUBLIC_CREATOR_MONTHLY;
const CREATOR_YEARLY = process.env.NEXT_PUBLIC_CREATOR_YEARLY;

const STUDIO_MONTHLY = process.env.NEXT_PUBLIC_STUDIO_MONTHLY;
const STUDIO_YEARLY = process.env.NEXT_PUBLIC_STUDIO_YEARLY;

const BRAND_MONTHLY = process.env.NEXT_PUBLIC_BRAND_MONTHLY;
const BRAND_YEARLY = process.env.NEXT_PUBLIC_BRAND_YEARLY;

const getProductId = (
  plan_type: string,
  subscription: "annual" | "monthly",
) => {
  switch (plan_type) {
    case "creator":
      return subscription == "monthly" ? CREATOR_MONTHLY : CREATOR_YEARLY;
    case "studio":
      return subscription == "monthly" ? STUDIO_MONTHLY : STUDIO_YEARLY;
    case "brand":
      return subscription == "monthly" ? BRAND_MONTHLY : BRAND_YEARLY;
    default:
      "";
  }
};

const PlanCard = ({
  type,
  current,
  onPlanSelect,
  cancelledState,
}: {
  type: string;
  current?: string;
  onPlanSelect: (type: string, billingFrequency: 'annual' | 'monthly') => void;
  cancelledState: boolean;
}) => (
  <div
    className={clsx(
      "h-full rounded-3xl bg-white/5 p-6 text-white transition",
    )}
  >
    <h2 className="3xl:text-5xl text-3xl">{type} <span className="text-white/20">{PLAN_TYPES[type].icon}</span></h2>
    <div className="my-3">
      {_.map(PLAN_TYPES[type].highlights, (item, i) => (
        <h3 key={i} className="3xl:text-2xl text-lg text-primary">
          → {item}
        </h3>
      ))}
    </div>

    <div className="mt-4 mb-7 space-y-4 sm:space-y-6">
      {_.map(FEATURES, (featureSet) => {
        const [key, items] = Object.entries(featureSet)[0];
        return (
          <div key={key}>
            <h3 className="3xl:text-2xl text-lg text-white/40 py-1">{key}</h3>
            <div className="list list-sm pro border-t-white/20 border-t-[1px]">
              {items.map((f: string, i: number) => {
                const hasAccess = _.includes(FEATURE_ACCESS[f], type);
                return (
                  <div key={i} className="item font-medium">
                    <span className={!hasAccess ? 'text-white/40' : ''}>{f}{" "}</span>
                    {hasAccess ? (
                      <span className="text-primary">
                        <Checkmark />
                      </span>
                    ) : (
                      <span className="text-white/20">
                        <Minus />
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        );
      })}
    </div>
    {type == current || type == 'free' ? (
      <div className={clsx(type == current && "border-2 border-white", "bg-white/10 w-full rounded-3xl m-auto h-[110px]")}>
        <div className="flex flex-col items-center justify-center h-full font-medium">
          <h3>{type != current ? "need to switch plans?" : "this is your current plan"}</h3>
          <h3 className='text-primary cursor-pointer' onClick={(e) => {
            e.preventDefault();
            onPlanSelect('free', 'monthly');
          }}>manage subscription</h3>
        </div>
      </div>
    ) : (
      <div className="h-[110px] flex flex-col justify-between">
        <button
          onClick={(e) => {
            e.preventDefault();
            !cancelledState && onPlanSelect(type, 'monthly');
          }}
          className="btn btn-primary rounded-full w-full">
          {`$${PLAN_TYPES[type].monthlyPrice}/mo`}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            !cancelledState && onPlanSelect(type, 'annual');
          }}
          className="btn btn-primary rounded-full w-full">
          {`$${PLAN_TYPES[type].annualPrice}/mo (paid annually)`}
        </button>
      </div>
    )}
  </div >
);

export default function PaymentPlansModal() {
  const user = useUserStore.useUser();
  const orgId = user?.organization_id;
  const token = useUserStore.useToken();

  const orgUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${user.organization.id}`;
  const {
    data: orgData,
    isValidating: isValidatingOrgData,
    error: orgError,
    mutate,
  } = useSWR([orgUrl, token.access_token], ([url, token]) =>
    axiosGetWithToken(url, token),
  );

  const orgTier = orgData?.organization.metadata.hypno_pro.current_tier;
  const cancelledState = !!orgData?.organization.metadata.hypno_pro.cancel_at;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const redirectToBillingPortal = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${user?.organization?.id}/billing_portal`;
    await axios
      .get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.access_token,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          const billingUrl = res.data.url;
          window.location.href = billingUrl;
        }
      })
      .catch((e) => {
        console.log(e);
      })
  };

  const handlePlanSelect = useCallback(
    async (type: string, billingFrequency: 'annual' | 'monthly') => {
      setIsLoading(true);
      if (type == "free") {
        // Redirect to billing portal
        redirectToBillingPortal();
        setIsLoading(false);
      } else {
        const alreadyPaidPlan = orgTier != "free";
        const subscriptionEndpoint = alreadyPaidPlan
          ? "change_subscription"
          : "subscribe";
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${orgId}/${subscriptionEndpoint}`;
        const payload = {
          subscription: {
            product_id: getProductId(type, billingFrequency),
          },
        };

        await axios
          .post(url, payload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token.access_token,
            },
          })
          .then(async (res) => {
            if (alreadyPaidPlan) {
              // Update subscription tier
              let updatedOrg = {
                ...orgData.organization,
                metadata: {
                  ...orgData.organization.metadata,
                  hypno_pro: {
                    ...orgData.organization.metadata.hypno_pro,
                    current_tier: type,
                  },
                },
              };
              mutate({ organization: { ...updatedOrg } });
              setIsLoading(false);
            } else {
              // Redirect to stripe checkout
              const data = res.data;
              const stripeUrl = data.url;
              window.location.href = stripeUrl;
            }
          })
          .catch((e) => {
            console.log(e);
            setIsLoading(false);
          });
      }
    },
    [orgTier],
  );

  return (
    <dialog
      id="payment_plans_modal"
      className="modal cursor-pointer overflow-y-scroll bg-[#333333]/50 backdrop-blur-[20px]"
    >
      <form
        method="dialog"
        className="modal-box relative max-w-[2000px] cursor-default space-y-8 rounded-[60px] bg-[#111]/90 px-[40px] py-[35px] tracking-tight"
      >
        <div className="flex justify-between">
          <div className="space-y-4">
            <h1 className="text-white">subscription</h1>
            <div className="flex flex-col gap-2">
              <h2 className={cancelledState ? "text-error" : "text-white/40"}>
                {cancelledState
                  ? "you are not currently subscribed, please renew via the billing portal to make changes to your subscription"
                  : orgTier == "custom"
                    ? "you are currently signed up for a custom plan. please contact us to make any changes."
                    : `you're on the ${orgTier} plan`}
              </h2>
              {(orgTier != "free" && orgTier != "custom") && <h2 className="text-primary cursor-pointer" onClick={redirectToBillingPortal}>manage billing →</h2>}
            </div>
          </div>
          <button className="flex h-[30px] w-[30px] cursor-pointer items-center sm:h-[60px] sm:w-[60px]">
            <div className="h-1 w-[30px] rounded-sm bg-white/40 sm:w-[60px]" />
          </button>
        </div>
        {orgTier != "custom" && (
          <>
            {isLoading ? (
              <div className="flex w-full flex-col items-center justify-center gap-4 py-8">
                <span className="loading loading-ring text-white sm:w-[50px]"></span>
                <h2 className="text-lg text-white">
                  updating your subscription plan...
                </h2>
              </div>
            ) : (
              <div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-4">
                  {_.map(["free", "creator", "studio", "brand"], (type, i) => (
                    <PlanCard
                      key={i}
                      type={type}
                      current={orgTier}
                      onPlanSelect={handlePlanSelect}
                      cancelledState={cancelledState}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </form>
      <form method="dialog" className="modal-backdrop">
        <button></button>
      </form>
    </dialog>
  );
}
