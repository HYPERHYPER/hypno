import axios from 'axios';
import type { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import _ from 'lodash';
import EventForm from '@/components/EventForm/EventForm';
import GlobalLayout from '@/components/GlobalLayout';
import withAuth from '@/components/hoc/withAuth';
import { convertFieldArrayToObject, isCustomGallery } from '@/helpers/event';
import { AutosaveStatusText, SaveStatus } from '@/components/Form/AutosaveStatusText';
import useUserStore from '@/store/userStore';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { axiosGetWithToken } from '@/lib/fetchWithToken';

interface ResponseData {
    status: number;
    message: string;
    event: any;
}

const EditEventPage = (props: ResponseData) => {
    const router = useRouter();
    const { query } = router;
    const { event : initialEvent } = props;

    const token = useUserStore.useToken();

    const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(query.eventId)}?include_overlays=true&include_ipad_screens=true`;
    const { data: eventData, isValidating: isValidatingEventData, error: eventError } = useSWR([eventUrl, token.access_token],
        ([url, token]) => axiosGetWithToken(url, token))
    
    const event = initialEvent || eventData?.event;
    const id = event?.id || null;
    const name = event?.name || '';
    const initialCustomFrontend = event?.custom_frontend;

    const [view, setView] = useState<'default' | 'data' | 'legal'>('default');
    const [status, setStatus] = useState<SaveStatus>('ready');

    // Provided array of changed fields [{field_name: value}]
    const submitForm = (changedFieldsArr: any) => {
        let payloadArr: any = [];
        let event: any = {};
        const eventKeys = ['name', 'is_private', 'blendmode', 'custom_gallery_assigned']
        let custom_frontend: any = {};
        const customFrontendKeys = ['logo_image', 'home_background_image', 'primary_color', 'data_capture', 'fields', 'data_capture_title', 'data_capture_subtitle', 'enable_legal', 'explicit_opt_in', 'terms_privacy', 'email_delivery'];
        let filter: any = {};
        let delivery: string = '';
        let metadata: any = {};
        let pro_raw_upload: boolean | undefined = undefined;

        // Build event payload - any field that's not watermark
        // Build watermark payload in seperate reqs by watermark_id
        _.forEach(changedFieldsArr, (field: any) => {
            for (const key in field) {
                if (key == 'qr_delivery') {
                    delivery = field[key];
                }
                if (key == 'filter') {
                    filter = { id: field[key] }
                }
                if (_.includes(customFrontendKeys, key)) {
                    custom_frontend[key] = key == 'fields' ? { ...field[key] } : field[key]
                }
                if (_.includes(eventKeys, key)) {
                    event[key] = field[key]
                }
                if (key == 'watermark') {
                    payloadArr.push(field);
                }
                if (key == 'ai_generation') {
                    metadata = { ai_generation: { ...field[key]} }
                }
                if (key == 'pro_raw_upload') {
                    pro_raw_upload = field[key];
                }
            }
        })

        const eventPayload = {
            ...(!_.isEmpty(event) && { event }),
            ...(!_.isEmpty(custom_frontend) && { custom_frontend }),
            ...(!_.isEmpty(filter) && { filter }),
            ...(delivery && { delivery }),
            ...(!_.isEmpty(metadata) && { metadata }),
            ...(!_.isNil(pro_raw_upload) && { pro_raw_upload })
        }
        if (!_.isEmpty(eventPayload)) {
            payloadArr.push(eventPayload);
        }
        console.log('payload', eventPayload)
        const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${id}`;

        // Create an array of promises for graphics (watermark) update + all other event config updates
        const promises = payloadArr?.map((payload: any) => {
            const isWatermarkPayload = !_.isEmpty(payload.watermark);
            let url = isWatermarkPayload ? `${eventUrl}/watermarks/${payload.watermark.id}` : eventUrl;
            if (isWatermarkPayload) {
                delete payload.watermark.id
            }

            return axios.put(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token.access_token,
                },
            });
        });

        // Use Promise.all to wait for all promises to resolve
        return Promise.all(promises);
    }

    useEffect(() => {
        if (eventError || (!_.isNil(event?.event_type) && event?.event_type !== 'hypno_pro')) {
            router.push('/404');
        }
    }, [eventError, event])

    if (!event && isValidatingEventData) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center'>
                <span className="loading loading-ring loading-lg sm:w-[200px] text-primary"></span>
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>{name || 'edit event'} | hypno™</title>
            </Head>

            <GlobalLayout paymentPlansModal={true}>
                <GlobalLayout.Header
                    title={view == 'default' ? 'edit' : view}
                    returnLink={view == 'default' ? { slug: `/e/${id}`, name: name } : undefined}
                    returnAction={view !== 'default' ? { onClick: () => setView('default'), name: name } : undefined}
                >
                    {AutosaveStatusText(status)}
                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <EventForm
                        view={view}
                        changeView={(view) => setView(view)}
                        event={{
                            ...props.event,
                            ...event
                        }}
                        onSubmit={submitForm}
                        updateStatus={(status) => setStatus(status)}
                        status={status}
                    />
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { eventId, accessToken: accessTokenParam } = context.query;
    // const cookieToken = nookies.get(context).hypno_token;
    let accessToken = context.req.cookies.hypno_token;
    // if (!accessToken) {
    //     return {
    //         notFound: true,
    //     }
    // }

    // Store access token in case of refresh
    // if (cookieToken !== accessToken) {
    //     nookies.set(context, 'hypno_token', String(accessToken));
    // }

    // Fetch event config
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}?include_overlays=true&include_ipad_screens=true`;
    const token = accessToken;
    let data: any = {};
    if (token && eventId) {
        await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        }).then(async (res) => {
            if (res.status === 200) {
                data = await res.data;
                const orgUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${res.data.event.client_id}`;
                const orgRes = await axios.get(orgUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                });
                data.event = {
                    ...data.event,
                    organization: orgRes.data.organization
                }
            }
        }).catch((e) => {
            console.log(e);
        })
    }

    if ((_.isEmpty(data) || data?.event?.event_type !== 'hypno_pro') && token && eventId) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            ...data,
        }
    };
};

export default withAuth(EditEventPage, 'protected');

