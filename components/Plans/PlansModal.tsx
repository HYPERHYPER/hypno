import { axiosGetWithToken } from "@/lib/fetchWithToken";
import useUserStore from "@/store/userStore";
import axios from "axios";
import clsx from "clsx";
import _ from "lodash";
import { useRouter } from "next/router";
import Checkmark from "public/pop/checkmark.svg";
import Minus from "public/pop/minus.svg";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

interface FeatureAccess {
  [key: string]: Array<string>;
}
const FEATURE_ACCESS: FeatureAccess = {
  camera: ["free", "creator", "studio", "brand"],
  filters: ["free", "creator", "studio", "brand"],
  graphics: ["creator", "studio", "brand"],
  effects: ["creator", "studio", "brand"],
  canon: ["studio", "brand"],
  gallery: ["free", "creator", "studio", "brand"],
  branding: ["creator", "studio", "brand"],
  "data capture": ["brand"],
  "custom legal": ["brand"],
  "your domain": ["brand"],
  "api access": ["brand"],
  "live support": ["studio", "brand"],
  "studio services": ["studio", "brand"],
  "hypno community": ["studio", "brand"],
};

const FEATURES = [
  {
    shoot: ["camera", "filters", "graphics", "effects", "canon"],
  },
  {
    share: [
      "gallery",
      "branding",
      "data capture",
      "custom legal",
      "your domain",
      "api access",
    ],
  },
  {
    more: ["live support", "studio services", "hypno community"],
  },
];

interface PlanType {
  [key: string]: any;
}
const PLAN_TYPES: PlanType = {
  free: {
    tagline: "shoot + share",
    annualPrice: 0,
    monthlyPrice: 0,
    users: 1,
    additionalPrice: 0,
    uploads: 100,
  },
  creator: {
    tagline: "endless creativity",
    annualPrice: 9,
    monthlyPrice: 15,
    users: 1,
    additionalPrice: 9,
    uploads: "unlimited",
  },
  studio: {
    tagline: "canon capture",
    annualPrice: 99,
    monthlyPrice: 125,
    users: 1,
    additionalPrice: 99,
    uploads: "unlimited",
  },
  brand: {
    tagline: "enterprise data/legal",
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
  billingFrequency,
  onPlanSelect,
  cancelledState,
}: {
  type: string;
  current?: string;
  billingFrequency?: "annual" | "monthly";
  onPlanSelect: (type: string) => void;
  cancelledState: boolean;
}) => (
  <div
    className={clsx(
      "h-full rounded-3xl border-2 bg-black p-6 text-white transition",
      type == current
        ? "border-2 border-white"
        : "hover:border-primary border-black",
    )}
  >
    <h2 className="3xl:text-5xl text-2xl">{type}</h2>
    <div className="mb-4 mt-6">
      <h3 className="3xl:text-2xl text-lg text-white/40">
        {PLAN_TYPES[type].tagline}
      </h3>
      <h3 className="3xl:text-2xl text-primary text-lg">
        $
        {billingFrequency == "annual"
          ? PLAN_TYPES[type].annualPrice
          : PLAN_TYPES[type].monthlyPrice}
        /mo
      </h3>
    </div>

    <div className="space-y-1 font-thin">
      {/* <h4>{PLAN_TYPES[type].users} {PLAN_TYPES[type].users > 1 ? 'users' : 'user'}</h4> */}
      <h4>
        each add&apos;l user $
        {billingFrequency == "annual"
          ? PLAN_TYPES[type].annualPrice
          : PLAN_TYPES[type].monthlyPrice}
        /mo
      </h4>
      <h4>
        {PLAN_TYPES[type].uploads != "unlimited"
          ? "100 upload limit"
          : "unlimited uploads"}
      </h4>
    </div>

    <div className="my-4 space-y-4 sm:space-y-6">
      {_.map(FEATURES, (featureSet) => {
        const [key, items] = Object.entries(featureSet)[0];
        return (
          <div key={key}>
            <h3 className="3xl:text-2xl text-lg text-white/40">{key}</h3>
            <div className="list list-sm pro">
              {items.map((f: string, i: number) => (
                <div key={i} className="item font-medium">
                  {f}{" "}
                  {_.includes(FEATURE_ACCESS[f], type) ? (
                    <span className="text-primary">
                      <Checkmark />
                    </span>
                  ) : (
                    <span className="text-white/20">
                      <Minus />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    {type == current ? (
      <div className="btn btn-disabled w-full rounded-2xl">current plan</div>
    ) : (
      <button
        className={
          cancelledState
            ? "btn btn-disabled w-full rounded-2xl"
            : "btn btn-primary w-full rounded-2xl"
        }
        onClick={(e) => {
          e.preventDefault();
          !cancelledState && onPlanSelect(type);
        }}
      >
        select plan
      </button>
    )}
  </div>
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

  const [billingFrequency, setBillingFrequency] = useState<
    "annual" | "monthly"
  >("annual");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePlanSelect = useCallback(
    async (type: string) => {
      setIsLoading(true);
      if (type == "free") {
        // Redirect to billing portal
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${user.organization.id}/billing_portal`;
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
              setIsLoading(false);
            }
          })
          .catch((e) => {
            console.log(e);
            setIsLoading(false);
          });
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
    [orgTier, billingFrequency],
  );

  // useEffect(() => {
  //     console.log('owner', window?.isPaymentPlanOwner);
  // }, []);

  return (
    <dialog
      id="payment_plans_modal"
      className="modal cursor-pointer bg-[#333333]/50 backdrop-blur-[20px]"
    >
      <form
        method="dialog"
        className="modal-box relative max-w-7xl cursor-default space-y-8 rounded-[60px] bg-[#111]/90 px-[40px] py-[35px] tracking-tight"
      >
        <div className="flex justify-between">
          <div className="space-y-4">
            <h1 className="text-white">subscription</h1>
            <div className="flex flex-row gap-4">
              <h2 className={cancelledState ? "text-error" : "text-primary"}>
                {cancelledState
                  ? "you are not currently subscribed, please renew via the billing portal to make changes to your subscription"
                  : orgTier == "custom"
                    ? "you are currently signed up for a custom subscription plan. please contact us to make any changes."
                    : "choose a subscription plan for your organization"}
              </h2>
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
                <div className="flex items-center justify-center gap-3 rounded-3xl bg-black p-4">
                  <span
                    className={clsx(
                      "text-lg transition sm:text-2xl",
                      billingFrequency == "monthly"
                        ? "text-primary"
                        : "text-white/30",
                    )}
                  >
                    monthly
                  </span>
                  <input
                    type="checkbox"
                    className="toggle pro"
                    checked={billingFrequency == "annual"}
                    onChange={() =>
                      setBillingFrequency((prev) =>
                        prev == "monthly" ? "annual" : "monthly",
                      )
                    }
                  />
                  <span
                    className={clsx(
                      "text-lg transition sm:text-2xl",
                      billingFrequency == "annual"
                        ? "text-primary"
                        : "text-white/30",
                    )}
                  >
                    annual (save 20%)
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                  {_.map(["free", "creator", "studio", "brand"], (type, i) => (
                    <PlanCard
                      key={i}
                      type={type}
                      current={orgTier}
                      onPlanSelect={handlePlanSelect}
                      billingFrequency={billingFrequency}
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
