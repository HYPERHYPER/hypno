import { axiosGetWithToken } from '@/lib/fetchWithToken';
import useUserStore from '@/store/userStore';
import axios from 'axios';
import clsx from 'clsx';
import _ from 'lodash';
import { useRouter } from 'next/router';
import Checkmark from 'public/pop/checkmark.svg';
import Minus from 'public/pop/minus.svg';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

interface FeatureAccess {
    [key: string]: Array<string>;
}
const FEATURE_ACCESS: FeatureAccess = {
    "camera": ['free', 'creator', 'studio', 'brand'],
    "filters": ['free', 'creator', 'studio', 'brand'],
    "graphics": ['creator', 'studio', 'brand'],
    "effects": ['creator', 'studio', 'brand'],
    "canon": ['studio', 'brand'],
    "gallery": ['free', 'creator', 'studio', 'brand'],
    "branding": ['creator', 'studio', 'brand'],
    "data capture": ['brand'],
    "custom legal": ['brand'],
    "your domain": ['brand'],
    "api access": ['brand'],
    "live support": ['studio', 'brand'],
    "studio services": ['studio', 'brand'],
    "hypno community": ['studio', 'brand']
}

const FEATURES = [
    {
        'shoot': [
            "camera",
            "filters",
            "graphics",
            "effects",
            "canon"]
    },
    {
        'share': [
            "gallery",
            "branding",
            "data capture",
            "custom legal",
            "your domain",
            "api access",
        ]
    }, {
        'more': [
            "live support",
            "studio services",
            "hypno community"
        ]
    }
]

interface PlanType {
    [key: string]: any;
}
const PLAN_TYPES: PlanType = {
    free: {
        tagline: 'shoot + share',
        annualPrice: 0,
        monthlyPrice: 0,
        users: 1,
        additionalPrice: 0,
        uploads: 100,
    },
    creator: {
        tagline: 'endless creativity',
        annualPrice: 9,
        monthlyPrice: 15,
        users: 1,
        additionalPrice: 9,
        uploads: 'unlimited'
    },
    studio: {
        tagline: 'canon capture',
        annualPrice: 999,
        monthlyPrice: 1250,
        users: 1,
        additionalPrice: 999,
        uploads: 'unlimited'

    },
    brand: {
        tagline: 'enterprise data/legal',
        annualPrice: 4999,
        monthlyPrice: 3999,
        users: 5,
        additionalPrice: 999,
        uploads: 'unlimited'
    }
}

const CREATOR_PLAN = 'price_1NT8F8A3gTSa41Ce8riWJDJw'
const CREATOR_PLAN_DISCOUNTED = 'price_1NQxqWA3gTSa41Ce2ofRCgn4'

const STUDIO_PLAN = 'price_1NT8G6A3gTSa41CeZ2XYleYk'
const STUDIO_PLAN_DISCOUNTED = 'price_1NQxrDA3gTSa41CeORPpKPGl'

const BRAND_PLAN = 'price_1NT8HLA3gTSa41CeELa2qyxq'
const BRAND_PLAN_DISCOUNTED = 'price_1NQxrWA3gTSa41Ce8cmJ1j77'

const getProductId = (plan_type: string, subscription: 'annual' | 'monthly') => {
    switch (plan_type) {
        case 'creator': return subscription == 'monthly' ? CREATOR_PLAN : CREATOR_PLAN_DISCOUNTED;
        case 'studio': return subscription == 'monthly' ? STUDIO_PLAN : STUDIO_PLAN_DISCOUNTED;
        case 'brand': return subscription == 'monthly' ? BRAND_PLAN : BRAND_PLAN_DISCOUNTED;
        default: '';
    }
}

const PlanCard = ({ type, current, billingFrequency, onPlanSelect }: { type: string, current?: string, billingFrequency?: 'annual' | 'monthly', onPlanSelect: (type: string) => void; }) => (
    <div className={clsx("text-white bg-black h-full rounded-3xl p-6 border-2 transition", type == current ? 'border-white border-2' : 'border-black hover:border-primary')}>
        <h2 className="text-2xl 3xl:text-5xl">{type}</h2>
        <div className='mb-4 mt-6'>
            <h3 className="text-lg 3xl:text-2xl text-white/40">{PLAN_TYPES[type].tagline}</h3>
            <h3 className="text-lg 3xl:text-2xl text-primary">${billingFrequency == 'annual' ? PLAN_TYPES[type].annualPrice : PLAN_TYPES[type].monthlyPrice}/mo</h3>
        </div>

        <div className='font-thin space-y-1'>
            <h4>{PLAN_TYPES[type].users} {PLAN_TYPES[type].users > 1 ? 'users' : 'user'}</h4>
            <h4>each add&apos;l  user ${PLAN_TYPES[type].additionalPrice}/mo</h4>
            <h4>{PLAN_TYPES[type].uploads != 'unlimited' ? '100 uploads/mo' : 'unlimited uploads'}</h4>
        </div>

        <div className='space-y-4 sm:space-y-6 my-4'>
            {_.map(FEATURES, (featureSet) => {
                const [key, items] = Object.entries(featureSet)[0];
                return (
                    <div key={key}>
                        <h3 className="text-lg 3xl:text-2xl text-white/40">{key}</h3>
                        <div className="list list-sm pro">
                            {items.map((f: string, i: number) => <div key={i} className="item font-medium">{f} {_.includes(FEATURE_ACCESS[f], type) ? <span className='text-primary'><Checkmark /></span> : <span className='text-white/20'><Minus /></span>}</div>)}
                        </div>
                    </div>
                )
            })}
        </div>
        {type == current ?
            <div className='btn btn-disabled rounded-2xl w-full'>current plan</div>
            : type == 'brand' ?
                <a href={`mailto:sales@hypno.com?subject=${encodeURIComponent("hypno pro brand subscription from $9999/mo")}`} className='btn btn-primary rounded-2xl w-full'>contact sales</a>
                :
                <button className='btn btn-primary rounded-2xl w-full' onClick={(e) => { e.preventDefault(); onPlanSelect(type) }}>select plan</button>
        }
    </div>
)

export default function PaymentPlansModal() {
    const user = useUserStore.useUser();
    const orgId = user?.organization_id;
    const token = useUserStore.useToken();

    const orgUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${user.organization.id}`;
    const { data: orgData, isValidating: isValidatingOrgData, error: orgError, mutate } = useSWR([orgUrl, token.access_token],
        ([url, token]) => axiosGetWithToken(url, token))

    const orgTier = orgData?.organization.metadata.hypno_pro.current_tier;

    const [billingFrequency, setBillingFrequency] = useState<'annual' | 'monthly'>('monthly');

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handlePlanSelect = useCallback(async (type: string) => {
        setIsLoading(true);
        if (type == 'free') {
            // Redirect to billing portal
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
                    setIsLoading(false);
                }
            }).catch((e) => {
                console.log(e);
                setIsLoading(false);
            })
        } else {
            const alreadyPaidPlan = orgTier != 'free';
            const subscriptionEndpoint = alreadyPaidPlan ? 'change_subscription' : 'subscribe';
            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${orgId}/${subscriptionEndpoint}`;
            const payload = {
                subscription: {
                    product_id: getProductId(type, billingFrequency)
                }
            }

            await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token.access_token,
                },
            }).then(async (res) => {
                if (alreadyPaidPlan) {
                    // Update subscription tier
                    let updatedOrg = {
                        ...orgData.organization,
                        metadata: {
                            ...orgData.organization.metadata,
                            hypno_pro: {
                                ...orgData.organization.metadata.hypno_pro,
                                current_tier: type,
                            }
                        }
                    }
                    mutate({ organization: { ...updatedOrg } });
                    setIsLoading(false);
                } else {
                    // Redirect to stripe checkout
                    const data = res.data;
                    const stripeUrl = data.url;
                    window.location.href = stripeUrl;
                }
            }).catch((e) => {
                console.log(e);
                setIsLoading(false);
            })
        }

    }, [orgTier, billingFrequency])

    // useEffect(() => {
    //     console.log('owner', window?.isPaymentPlanOwner);
    // }, []);

    return (
        <dialog id="payment_plans_modal" className="modal bg-[#333333]/50 backdrop-blur-[20px] cursor-pointer">
            <form method='dialog' className="modal-box cursor-default max-w-7xl px-[40px] py-[35px] relative bg-[#111]/90 rounded-[60px] tracking-tight space-y-8">
                <div className="flex justify-between">
                    <div className="space-y-4">
                        <h1 className="text-white">plans + pricing</h1>
                        <div className="flex flex-row gap-4">
                            <h2 className="text-primary">{orgTier == 'custom' ?
                                'you are currently signed up for a custom subscription plan. please contact us to make any changes.'
                                : 'choose a subscription plan for your organization'}
                            </h2>
                        </div>
                    </div>
                    <button className="h-[30px] sm:h-[60px] w-[30px] sm:w-[60px] flex items-center cursor-pointer">
                        <div className="bg-white/40 w-[30px] sm:w-[60px] h-1 rounded-sm" />
                    </button>
                </div>
                {orgTier != 'custom' &&
                    <>
                        {isLoading ? (
                            <div className='w-full flex flex-col justify-center items-center gap-4 py-8'>
                                <span className="loading loading-ring sm:w-[50px] text-white"></span>
                                <h2 className='text-white text-lg'>updating your subscription plan...</h2>
                            </div>
                        ) : (
                            <div>
                                <div className='flex items-center gap-3 justify-center bg-black p-4 rounded-3xl'>
                                    <span className={clsx('text-lg sm:text-2xl transition', billingFrequency == 'monthly' ? 'text-primary' : 'text-white/30')}>monthly</span>
                                    <input type='checkbox' className='toggle pro' checked={billingFrequency == 'annual'} onChange={() => setBillingFrequency((prev) => prev == 'monthly' ? 'annual' : 'monthly')} />
                                    <span className={clsx('text-lg sm:text-2xl transition', billingFrequency == 'annual' ? 'text-primary' : 'text-white/30')}>annual-20% off</span>
                                </div>

                                <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                    {_.map(['free', 'creator', 'studio', 'brand'], (type, i) => (
                                        <PlanCard key={i} type={type} current={orgTier} onPlanSelect={handlePlanSelect} billingFrequency={billingFrequency} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                }

            </form>
            <form method="dialog" className="modal-backdrop">
                <button></button>
            </form>
        </dialog>
    )
}