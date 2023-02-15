import { useRouter } from 'next/router';
import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import Spinner from '@/components/Spinner';
import useSWR from 'swr';
import { fetchWithToken } from '@/lib/fetchWithToken';
import Image from 'next/image';
import Link from 'next/link';

interface ResponseData {
    status: number;
    message: string;
    event: any;
}

const ManageEventGallery = (props: ResponseData) => {
    const { event: {
        id,
        name,
        metadata,
    } } = props;

    /* Setting up the data capture form for the gallery. */
    //   const [dataCapture, setDataCapture] = useState<boolean>(!!(event.fields || event.terms));
    //   const fields = _.map(event.fields, (f) => ({ id: f.toLowerCase().replaceAll(" ", "_"), name: f }));
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: metadata.title || '',
            subtitle: metadata.subtitle || '',
            fields: metadata.fields || [],
            logo: metadata.logo || '',
            background: metadata.background || '',
            color: metadata.color || '',
        }
    });

    const submitForm = async (data: any) => {
        if (!_.isEmpty(errors)) {
            console.log("submitForm errors", { errors });
            return;
        }

        console.log("submitForm", { data });

        /* Update metadata field of event */
        let eventMetadata = props.event.metadata || {};
        eventMetadata = {
            ...props.event.metadata,
            ...data,
        }
        console.log(eventMetadata)
        const url = `https://pro.hypno.com/api/v1/events/${id}.json`;
        const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
        let resp = await axios.put(url, { metadata: eventMetadata }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        }).then((e) => {
            console.log(e)
        }).catch((e) => {
            console.log(e)
        });
    }

    return (
        <>
            <Head>
                <title>{name || 'Hypno Pro Admin'}</title>
            </Head>

            <section className={`text-white bg-black min-h-screen p-10`}>
                <div className='flex justify-center'>
                    <Image className='h-auto' src={'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={"Hypno logo"} width={150} height={150} priority />
                </div>

                <div className={`sm:mx-auto h-full mt-8`}>
                    <Link href={`https://app.hypno.com/`}>app.hypno.com</Link>
                    <form onSubmit={handleSubmit(submitForm)} className='space-y-2 flex flex-col'>
                        <input 
                            className='input input-primary' 
                            placeholder='Title'
                            {...register('title')} />
                        <input 
                            className='input input-primary' 
                            placeholder='Subtitle'
                            {...register('subtitle')} />
                        <input 
                            className='input input-primary' 
                            placeholder='Data Capture Fields'
                            {...register('fields')} />
                        <input 
                            className='input input-primary' 
                            placeholder='Logo'
                            {...register('logo')} />
                        <input 
                            className='input input-primary' 
                            placeholder='Background'
                            {...register('background')} />
                        <input 
                            className='input input-primary' 
                            placeholder='Button Color'
                            {...register('color')} />
                        <input className='btn btn-primary' type='submit' value='SAVE' />
                    </form>
                </div>
            </section>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { eventId } = context.query;

    // Fetch event config
    const url = `https://pro.hypno.com/api/v1/events/${eventId}.json`;
    // const url = `http://localhost:4000/api/v1/events/${eventId}.json`;
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN; // TODO: use token stored as cookie from prev
    let resp = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    });
    let data = await resp.data;
    console.log(data)
    return {
        props: {
            ...data,
        }
    };
};

export default ManageEventGallery;
