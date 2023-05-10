import axios from 'axios';
import type { GetServerSideProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import _ from 'lodash';
import nookies, { parseCookies } from 'nookies'
import EventForm from '@/components/Events/EventForm';
import GlobalLayout from '@/components/GlobalLayout';
import withAuth from '@/components/hoc/withAuth';
import { EventMicrosite } from '@/types/event';

interface ResponseData {
    status: number;
    message: string;
    event: any;
}

const isCustomGallery = (metadata: EventMicrosite) => {
    const { logo, color, background, enable_legal, data_capture } = metadata;
    const customGalleryConfig = {
        logo, color, background, enable_legal, data_capture
    }
    return _.some(customGalleryConfig, _.identity);
}

const EditEventPage = (props: ResponseData) => {
    const { event: {
        id,
        name,
        metadata
    } } = props;

    const [view, setView] = useState<'default' | 'data' | 'legal'>('default');
    const [status, setStatus] = useState<'saving' | 'ready' | 'dirty' | 'success' | string>('ready');

    // Provided array of changed fields [{field_name: value}]
    const submitForm = (changedFieldsArr: any) => {
        let payloadArr: any = [];
        let event: any = {};
        const eventKeys = ['name', 'is_private']
        let microsite: any = {};
        const micrositeKeys = ['logo', 'background', 'color', 'data_capture', 'fields', 'data_capture_title', 'data_capture_subtitle', 'enable_legal', 'explicit_opt_in', 'terms_privacy', 'email_delivery', 'ai_generation'];
        let filter: any = {};
        let delivery: string = '';
        let custom_gallery = isCustomGallery(metadata);

        // Build event payload - any field that's not watermark
        // Build watermark payload in seperate reqs by watermark_id
        _.forEach(changedFieldsArr, (field: any) => {
            for (const key in field) {
                console.log('key', key)
                if (key == 'qr_delivery') {
                    delivery = field[key];
                }
                if (key == 'filter') {
                    filter = {id: field[key]}
                }
                if (_.includes(micrositeKeys, key)) {
                    microsite[key] = field[key]
                }
                if (_.includes(eventKeys, key)) {
                    event[key] = field[key]
                }
                if (key == 'watermark') {
                    payloadArr.push(field);
                }
                if (key == 'custom_gallery') {
                    custom_gallery = field[key];
                }
            }
        })

        if (!custom_gallery) {
            microsite = {
                logo: '',
                background: '',
                color: '',
                enable_legal: false,
                data_capture: false,
            }
        }
        
        const eventPayload = {
            ...(!_.isEmpty(event) && { event }),
            ...(!_.isEmpty(microsite) && { microsite }),
            ...(!_.isEmpty(filter) && { filter }),
            ...(delivery && { delivery }),
        }
        if (!_.isEmpty(eventPayload)) {
            payloadArr.push(eventPayload);
        }

        const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${id}`;
        const token = parseCookies().hypno_token;

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
                    Authorization: 'Bearer ' + token,
                },
            });
        });

        // Use Promise.all to wait for all promises to resolve
        return Promise.all(promises);
    }

    return (
        <>
            <Head>
                <title>{name || 'edit event'} | hypno™</title>
            </Head>

            <GlobalLayout>
                <GlobalLayout.Header
                    title={view == 'default' ? 'edit' : view}
                    returnLink={view == 'default' ? { slug: `/e/${id}`, name: name } : undefined}
                    returnAction={view !== 'default' ? { onClick: () => setView('default'), name: name } : undefined}
                >
                    {status == 'ready' && <h2>ready for changes</h2>}
                    {status == 'saving' && <h2 className='text-white'>saving...</h2>}
                    {status == 'dirty' && <h2>unsaved changes</h2>}
                    {status == 'success' && <h2 className='text-primary'>changes saved!</h2>}
                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <EventForm
                        view={view}
                        changeView={(view) => setView(view)}
                        event={props.event}
                        onSubmit={submitForm}
                        updateStatus={(status) => setStatus(status)}
                    />
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { eventId, accessToken: accessTokenParam } = context.query;
    const cookieToken = nookies.get(context).hypno_token;
    let accessToken = accessTokenParam || cookieToken;
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
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventId}?include_overlays=true&include_ipad_screens=true`;
    const token = accessToken;
    let data: any = {};
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

    if (_.isEmpty(data)) {
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

