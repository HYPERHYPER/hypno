import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import _ from 'lodash';
import { getPlaiceholder } from 'plaiceholder';
import GlobalLayout from '@/components/GlobalLayout';
import CenteredDetailView from '@/components/Gallery/CenteredDetailView';
import useUserStore from '@/store/userStore';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { axiosGetWithToken } from '@/lib/fetchWithToken';
import withAuth from '@/components/hoc/withAuth';
import { useEffect } from 'react';

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

interface ResponseData {
    photo: ImageData;
    placeholder: any;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default withAuth(DetailGallery, 'protected');
function DetailGallery(props: ResponseData) {
    const { photo, placeholder } = props;
    const router = useRouter();

    const token = useUserStore.useToken();

    const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(photo.event_id)}`;
    const { data: eventData, isValidating: isValidatingEventData, error: eventError } = useSWR([eventUrl, token.access_token],
        ([url, token]) => axiosGetWithToken(url, token));
    useEffect(() => {
        // Block page if don't have access to view event
        if (eventError) {
            router.push('/404');
        }
    }, [eventError]);

    const galleryTitle = eventData?.event?.name || '';
    const aiGeneration = eventData?.event?.metadata?.ai_generation || null;
    const { base64, img } = placeholder;
    const imageProps = {
        width: img.width,
        height: img.height,
        blurDataURL: base64,
    }

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
                <title>{galleryTitle ? `${galleryTitle} | hypno™` : 'hypno™'}</title>
                <meta name="description" content="Taken with HYPNO: The animated, social photo booth" />
                <meta name="og:image" content={photo.posterframe} />
                <meta name="og:image:type" content='image/jpeg' />
                <meta name="og:video" content={photo.mp4_url} />
                <meta name="og:video:type" content='video/mp4' />
            </Head>

            <GlobalLayout>
                <GlobalLayout.Content>
                    <CenteredDetailView
                        asset={photo}
                        config={{ aiGeneration, qr_asset_download: eventData?.metadata?.qr_asset_download }} 
                        imageProps={imageProps} />
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { photoSlug } = context.query;
    if (_.isNil(String(photoSlug))) { return { notFound: true } }

    let photoData = {};

    try {
        // Fetch token
        const tokenUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth/token`;
        const tokenPayload = {
            grant_type: "client_credentials",
            client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
            scope: "custom_frontend"
        };
        const tokenRes = await axios.post(tokenUrl, tokenPayload, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        let token = tokenRes.data?.access_token;

        // Fetch asset for detail view
        if (photoSlug) {
            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/photos/${photoSlug}/custom_frontend_show`;
            const res = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            });
            photoData = res.data;
            if (photoSlug) {
                const placeholder = await getPlaiceholder(res.data.photo.urls.url);
                photoData = {
                    ...photoData,
                    placeholder
                };
            }
        }
    } catch (e) {
        console.log(e)
        if (_.isEmpty(photoData)) {
            return {
                notFound: true
            }
        }
    }

    return {
        props: {
            ...photoData,
        }
    }
};
