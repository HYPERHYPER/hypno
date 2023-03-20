import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import _ from 'lodash';
import Spinner from '@/components/Spinner';
import GalleryNavBar from '@/components/Gallery/GalleryNavBar';
import { Footer } from '@/components/Footer';
import DetailView from '@/components/Gallery/DetailView';

type ImageData = {
    id: number;
    event_id: number;
    event_name: string;
    slug: string;
    media_slug: string;
    state: string;
    url: string;
    jpeg_url: string;
    jpeg_thumb_url: string;
    jpeg_3000_thumb_url: string;
    posterframe: string;
    gif: string;
    ipad_id: number;
    uploaded: string;
    updated_at: string;
    moderated: boolean;
    captured_at: string;
    format_generation: string; //(actually a number in quotes)
    grizzly_url: string;
    download_url: string;
    hi_res_url: string; //not in use
    raw_asset_url: string;
    raw_asset_mp4_url: string; // not in use
    metadata: Object; // need to type?
    export: boolean;
    export_settings: Object; //need to type
    width: number;
    height: number;
    mp4_url: string;
};

type EventData = {
    name: string;
    fields: string[];
    gallery_title: string;
    gallery_subtitle: string;
    data_capture_title: string;
    data_capture_subtitle: string;
    data_capture_screen: boolean;
    terms: string;
    privacy: string;
    logo: string;
    background: string;
    color: string;
    terms_and_conditions: string;
    email_delivery: boolean;
    ai_generation: any;
}

interface ResponseData {
    status: number;
    message: string;
    photo: ImageData;
    event: EventData;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const DetailGallery = (props: ResponseData) => {
    const { photo } = props;

    const galleryTitle = photo?.event_name;

    // const handleReplicate = async () => {
    //     console.log('predicting')
    //     const buffer = await fetch(`/api/file?url=${photo.url}`)
    //         .then((res) => res.json())
    //         .then((data) => {
    //             console.log('imgdata', data)
    //             return data.data
    //         })
    //     const response = await fetch("/api/predictions", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             version: '7af9a66f36f97fee2fece7dcc927551a951f0022cbdd23747b9212f23fc17021',
    //             // prompt: 'add glowing blur around person',
    //             image: photo.url,
    //         }),
    //     });
    //     let prediction = await response.json();
    //     console.log(prediction);
    //     if (response.status !== 201) {
    //         setError(prediction.detail);
    //         return;
    //     }
    //     setPrediction(prediction);

    //     while (
    //         prediction.status !== "succeeded" &&
    //         prediction.status !== "failed"
    //     ) {
    //         await sleep(1000);
    //         const response = await fetch("/api/predictions/" + prediction.id);
    //         prediction = await response.json();
    //         if (response.status !== 200) {
    //             setError(prediction.detail);
    //             return;
    //         }
    //         console.log({ prediction })
    //         setPrediction(prediction);
    //     }
    // }

    return (
        <>
            <Head>
                <title>{'HYPNO® Presents: ' + galleryTitle || 'Hypno'}</title>
                <meta name="description" content="Taken with HYPNO: The animated, social photo booth" />
            </Head>

            <div className='min-h-screen bg-black'>
                <GalleryNavBar name={galleryTitle} gallerySlug={String(photo?.event_id)} />
                <section className={`text-white bg-black`}>
                    <DetailView asset={photo} />
                </section>
                <Footer />
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { photoSlug } = context.query;

    // Request to get photo for detail view
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/photos/${photoSlug}.json`;
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    let resp = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    });
    let data = await resp.data;

    const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${data.event_id}.json`;
    let eventRes = await axios.get(eventUrl, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    });
    let eventData = await eventRes.data?.event;

    return {
        props: {
            ...data,
            event: eventData,
        }
    }
};

export default DetailGallery;
