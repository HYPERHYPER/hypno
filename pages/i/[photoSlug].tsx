import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import _ from 'lodash';
import Spinner from '@/components/Spinner';
import AutosizeImage from '@/components/AutosizeImage';
import GalleryNavBar from '@/components/Gallery/GalleryNavBar';
import Image from 'next/image';

import * as Generation from "@/lib/generation/generation_pb";
import {
    buildGenerationRequest,
    executeGenerationRequest,
    onGenerationComplete,
} from "../../helpers/stableDiffusion";

import { client, metadata } from '@/lib/stabilityClient';
import { useEffect, useState } from 'react';
import { parseLink } from '@/helpers/text';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/helpers/image';

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
    status: number;
    message: string;
    photo: ImageData;
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
                    <div className={`sm:mx-auto h-full mb-[35px] px-[90px] w-full flex justify-center flex-col items-center`}>
                        <div className='relative bg-white/10 backdrop-blur-[50px] max-h-[75vh]'>
                            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                                <Spinner />
                            </div>

                            {photo.gif ? (
                                <div className='block'>
                                    <video className='max-w-full max-h-[75vh]' src={photo.mp4_url} autoPlay loop playsInline poster={photo.posterframe} />
                                </div>
                            ) : (
                                <div className='block'>
                                    <img src={photo.url} alt={photo.event_name + photo.id} className='max-h-[75vh]' />
                                    {/* <AutosizeImage
                                        src={photo.url}
                                        alt={photo.event_name + photo.id}
                                    /> */}
                                </div>
                            )}
                        </div>
                        <div className='mt-3'>
                            <a className='btn btn-primary' href={photo.download_url}>DOWNLOAD</a>
                        </div>
                        {/* {data && <img src={`data:image/png;base64,${data}`} />}
                        {mask && <img src={`${mask}`} />}
                        {hfData && <img src={`${hfData}`} />}
                        {prediction && (
                            <div>
                                {prediction.output && (
                                    <div>
                                        <Image
                                            fill
                                            src={prediction.output}
                                            alt="output"
                                            sizes='100vw'
                                        />
                                    </div>
                                )}
                                <p>status: {prediction.status}</p>
                            </div>
                        )} */}
                    </div>

                </section>
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

    return {
        props: {
            ...data,
        }
    }
};

export default DetailGallery;
