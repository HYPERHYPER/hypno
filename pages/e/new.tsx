import axios from 'axios';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import _ from 'lodash';
import EventForm from '@/components/EventForm/EventForm';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import { useRouter } from 'next/router';
import { toHexCode } from '@/helpers/color';
import { EventPayload } from '@/types/event';
import { convertFieldArrayToObject } from '@/helpers/event';
import useUserStore from '@/store/userStore';

interface ResponseData {
    status: number;
    message: string;
    event: any;
}

const transformWatermarks = (watermarks: any) => {
    const arr = [];
    for (const key in watermarks) {
        if (Object.hasOwnProperty.call(watermarks, key)) {
            if (watermarks[key]) {
                arr.push({ title: key, url: watermarks[key] });
            }
        }
    }
    return arr;
}

export default withAuth(NewEventPage, 'protected');
function NewEventPage(props: ResponseData) {
    const router = useRouter();

    const token = useUserStore.useToken();

    const [view, setView] = useState<'default' | 'data' | 'legal'>('default');
    const [status, setStatus] = useState<'saving' | 'ready' | 'valid' | 'success' | 'error' | string>('ready');

    const [eventData, setEventData] = useState<any>();

    useEffect(() => {
        if (eventData?.name) setStatus('valid')
        else setStatus('ready')
    }, [eventData])

    const submitForm = async () => {
        setStatus('saving')

        console.log("submitForm", { eventData });
        const payload: EventPayload = {
            event: {
                name: eventData.name,
                client_id: eventData.org_id,
                is_private: eventData.is_private,
            },
            custom_frontend: {
                logo_image: eventData.logo_image,
                home_background_image: eventData.home_background_image,
                primary_color: toHexCode(eventData.primary_color),
                fields: convertFieldArrayToObject(eventData.fields),
                data_capture: eventData.data_capture,
                data_capture_title: eventData.data_capture_title,
                data_capture_subtitle: eventData.data_capture_subtitle,
                enable_legal: eventData.enable_legal,
                explicit_opt_in: eventData.explicit_opt_in,
                terms_privacy: eventData.terms_privacy
            },
            ...(eventData.filter && {
                filter: {
                    id: eventData.filter
                }
            }),
            ...(eventData.watermarks && { watermarks: transformWatermarks(eventData.watermarks) }),
            delivery: eventData.qr_delivery ? "qr_gallery" : "qr"
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events`;

        await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token.access_token,
            },
        }).then(async (res) => {
            setStatus('success');
            const data = await res.data;
            const editEventUrl = `/e/${data.event.id}`
            router.push(editEventUrl);
        }).catch((e) => {
            console.log(e)
            setStatus('error');
        });
    }

    return (
        <>
            <Head>
                <title>new event | hypno™</title>
            </Head>
            <GlobalLayout paymentPlansModal={true}>
                <GlobalLayout.Header
                    title={view == 'default' ? 'new event' : view}
                    returnLink={view == 'default' ? { slug: '/dashboard', name: 'dashboard' } : undefined}
                    returnAction={view !== 'default' ? { onClick: () => setView('default'), name: 'new event' } : undefined}
                >
                    {(status == 'ready' || (status == 'valid' && _.isEmpty(eventData?.name))) && <h2>ready for changes</h2>}
                    {(status == 'valid' && !_.isEmpty(eventData?.name)) &&
                        <button className='tracking-tight btn btn-primary rounded-full' onClick={submitForm}>
                            <h2>create</h2>
                        </button>
                    }
                    {status == 'error' && <h2 className='text-red-500'>oops! error...</h2>}
                    {status == 'success' && <h2 className='text-primary'>success!</h2>}
                    {status == 'saving' && <h2 className='text-white'>saving...</h2>}
                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <EventForm
                        view={view}
                        changeView={(view) => setView(view)}
                        updateData={(data) => setEventData(data)}
                    />
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    );
};


