import axios from 'axios';
import type { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import _ from 'lodash';
import nookies, { parseCookies } from 'nookies'
import EventForm from '@/components/Events/EventForm';
import GlobalLayout from '@/components/GlobalLayout';
import DotsX from 'public/pop/dots-x.svg';
import withAuth from '@/components/hoc/withAuth';

interface ResponseData {
    status: number;
    message: string;
    event: any;
}

const EditEventPage = (props: ResponseData) => {
    const { event: {
        id,
        name,
    } } = props;

    const [view, setView] = useState<'default' | 'data' | 'legal'>('default');
    const [status, setStatus] = useState<'saving' | 'ready' | 'dirty' | 'success' | string>('ready');

    const submitForm = (payload: any) => {
        // setSavedChangesStatus('saving');
        // if (!_.isEmpty(errors)) {
        //     console.log("submitForm errors", { errors });
        //     return;
        // }

        // console.log("submitForm", { data });
        // const terms_and_conditions = data.terms_and_conditions;
        // delete data['terms_and_conditions']

        // /* Update metadata field of event */
        // let eventMetadata = props.event.metadata || {};
        // eventMetadata = {
        //     ...props.event.metadata,
        //     ...data,
        //     color: `${_.startsWith(config.color, '#') ? "" : "#"}${config.color}`,
        //     fields: (!_.isEmpty(data.fields) && _.first(data.fields) != '') ? _.map(_.split(data.fields, ','), (f) => f.trim()) : [],
        // }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${id}.json`;
        const token = parseCookies().hypno_token;
        return axios.put(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        })
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
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${eventId}.json`;
    const token = accessToken;
    let data : any = {};
    await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    }).then(async (res) => {
        if (res.status === 200) {
            data = await res.data;
            const orgUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${res.data.event.organization_id}`;
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

