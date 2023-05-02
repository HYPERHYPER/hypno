import axios from 'axios';
import type { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import _ from 'lodash';
import nookies, { parseCookies } from 'nookies'
import EventForm from '@/components/Events/EventForm';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';

interface ResponseData {
    status: number;
    message: string;
    event: any;
}

export default withAuth(NewEventPage, 'protected');
function NewEventPage(props: ResponseData) {
    const user = useUserStore.useUser();
    const [view, setView] = useState<'default' | 'data' | 'legal'>('default');
    const [status, setStatus] = useState<'saving' | 'ready' | 'dirty' | 'success' | string>('ready');

    const [eventData, setEventData] = useState<any>();

    const submitForm = () => {
        // setSavedChangesStatus('saving');
        // if (!_.isEmpty(errors)) {
        //     console.log("submitForm errors", { errors });
        //     return;
        // }

        console.log("submitForm", { eventData });
        const payload = {
            event: {
                name: eventData.event_name,
                party_slug: "",
                first_starts_at: "",
                last_ends_at: "",
                client_id: eventData.client_id,
                is_private: eventData.is_private,
            },
            microsite: {
                logo: eventData.logo,
                background: eventData.background,
                color: `${_.startsWith(eventData.color, '#') ? "" : "#"}${eventData.color}`,
                data_capture: eventData.data_capture,
                fields: (!_.isEmpty(eventData.fields) && _.first(eventData.fields) != '') ? _.map(_.split(eventData.fields, ','), (f) => f.trim()) : [],
                data_capture_title: eventData.data_capture_title,
                data_capture_subtitle: eventData.data_capture_subtitle,
                enable_legal: eventData.enable_legal,
                explicit_opt_in: eventData.explicit_opt_in,
                terms_privacy: eventData.terms_privacy,
            },
            filter: {
                id: eventData.filterId
            },
            watermarks: eventData.watermarks,
            delivery: eventData.delivery ? "mini gallery" : ""
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events`;
        const token = parseCookies().hypno_token;
        return axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        })
    }

    console.log(eventData)

    return (
        <>
            <Head>
                <title>new event | hypno™</title>
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title={view == 'default' ? 'new event' : view}
                    returnLink={view == 'default' ? { slug: '/dashboard', name: 'dashboard' } : undefined}
                    returnAction={view !== 'default' ? { onClick: () => setView('default'), name: 'new event' } : undefined}
                >
                    {!eventData?.event_name ? (
                        <h2>ready for changes</h2>
                    ) : (
                        <button className='tracking-tight' onClick={submitForm}>
                            <h2 className={'text-primary'}>create</h2>
                        </button>
                    )}

                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <EventForm
                        view={view}
                        changeView={(view) => setView(view)}
                        event={props.event}
                        onSubmit={submitForm}
                        updateData={(data) => setEventData(data)}
                    />
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    );
};


