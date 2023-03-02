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

    const [data, setData] = useState<string>();
    const [prediction, setPrediction] = useState<any>(null);
    const [error, setError] = useState(null);

    const handleGenerateImage = async () => {
        const buffer = await fetch(`/api/file?url=${photo.url}`)
            .then((res) => res.json())
            .then((data) => {
                console.log('imgdata', data)
                return data.data
            })
        // DreamStudio uses an Image Strength slider to control the influence of the initial image on the final result.
        // This "Image Strength" is a value from 0-1, where values close to 1 yield images very similar to the init_image
        // and values close to 0 yield imges wildly different than the init_image. This is just another way to calculate
        // stepScheduleStart, which is done via the following formula: stepScheduleStart = 1 - imageStrength.  This means
        // an image strength of 35% would result in a stepScheduleStart of 0.65.
        const imageStrength = 0.5;
        const request = buildGenerationRequest("stable-diffusion-512-v2-1", {
            type: "image-to-image",
            prompts: [
                {
                    text: "a person wearing halo armor standing in a field, a poster by Miyamoto, trending on polycount, sots art, official art, reimagined by industrial light and magic, hi-res, hyper realistic, unreal engine 5, centered, facing the camera, smoke and fog in background, no helmet on head",
                },
            ],
            stepScheduleStart: 1 - imageStrength,
            initImage: buffer,
            // seed,
            width: 256,
            height: 256,
            samples: 1,
            cfgScale: 8,
            steps: 25,
            sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
        });

        executeGenerationRequest(client, request, metadata)
            .then((res) => {
                const imageDataUrls = onGenerationComplete(res);
                setData(_.first(imageDataUrls) || '');
            })
            .catch((error) => {
                console.error("Failed to make text-to-image request:", error);
            });
    }

    const handleReplicate = async () => {
        console.log('predicting')
        const buffer = await fetch(`/api/file?url=${photo.url}`)
            .then((res) => res.json())
            .then((data) => {
                console.log('imgdata', data)
                return data.data
            })
        const response = await fetch("/api/predictions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: 'add glowing blur around person',
                image: photo.url,
            }),
        });
        let prediction = await response.json();
        console.log(prediction);
        if (response.status !== 201) {
            setError(prediction.detail);
            return;
        }
        setPrediction(prediction);

        while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed"
        ) {
            await sleep(1000);
            const response = await fetch("/api/predictions/" + prediction.id);
            prediction = await response.json();
            if (response.status !== 200) {
                setError(prediction.detail);
                return;
            }
            console.log({ prediction })
            setPrediction(prediction);
        }
    }

    const handleHuggingFace = async () => {
        const buffer = await fetch(`/api/file?url=${photo.url}`)
            .then((res) => res.json())
            .then((data) => {
                console.log('imgdata', data)
                return data.data
            })

        const token = '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';
        const res = await fetch("https://nielsr-clipseg.hf.space/run/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({data: [
                buffer.toString('base64'),
                'person'
            ]}),
        });

        console.log('done!', res);
    }

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
                        <div className='relative bg-white/10 backdrop-blur-[50px] h-[75vh]'>
                            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                                <Spinner />
                            </div>
                            {/* <AutosizeImage
                                src={photo.posterframe}
                                alt={photo.event_name + photo.id}
                            /> */}
                            <div className='block '>
                            <video className='max-w-full max-h-[75vh]' src={photo.mp4_url} autoPlay loop playsInline poster={photo.posterframe} />
                            </div>
                        </div>
                        <div>
                            <a className='btn btn-accent' href={photo.download_url}>DOWNLOAD</a>
                            <button className='ml-3 btn btn-info' onClick={handleGenerateImage}>TESTING</button>
                            <button className='ml-3 btn btn-info' onClick={handleReplicate}>REPLICATE</button>
                            <button className='ml-3 btn btn-info' onClick={handleHuggingFace}>HUGGING FACE</button>
                        </div>
                        {data && <img src={`data:image/jpeg;base64,${data}`} />}
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
                        )}
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
    console.log(data)

    return {
        props: {
            ...data,
        }
    }
};

export default DetailGallery;
