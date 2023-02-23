import { useRouter } from 'next/router';
import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useState, useRef, useEffect } from 'react';
import ArrowRight from '../../public/pop/arrow-right.svg';
import ArrowLeft from '../../public/pop/arrow-left.svg';
import Head from 'next/head';
import _ from 'lodash';
import { getEventData } from '../api/pro/[eventId]';
import { useForm } from 'react-hook-form';
import { toTextColor } from '@/helpers/color';
import Spinner from '@/components/Spinner';
import useSWRInfinite from 'swr/infinite';
import { fetchWithToken } from '@/lib/fetchWithToken';
import { FadeIn } from 'react-slide-fade-in';
import Image from 'next/image';
import AutosizeImage from '@/components/AutosizeImage';
import { parseLink } from '@/helpers/text';
import GalleryNavBar from '@/components/GalleryNavBar';

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
}

interface ResponseData {
    status: number;
    message: string;
    photo: ImageData;
}

const DetailGallery = (props: ResponseData) => {
    const { photo } = props;

    const galleryTitle = photo?.event_name;

    return (
        <>
            <Head>
                <title>{'HYPNO® Presents: ' + galleryTitle || 'Hypno'}</title>
                <meta name="description" content="Taken with HYPNO: The animated, social photo booth" />
            </Head>

            <div className='min-h-screen bg-black'>
                <GalleryNavBar name={galleryTitle} gallerySlug={String(photo?.event_id)} />
                <section className={`text-white bg-black border-t-white/20 border-solid border-t-[1px]`}>
                    <div className={`sm:mx-auto h-full mb-[35px] px-[90px] w-full flex justify-center`}>
                        <div className='relative bg-white/10 backdrop-blur-[50px] w-[500px] max-w-[30vw]'>
                            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                                <Spinner />
                            </div>
                            <AutosizeImage
                                src={photo.posterframe}
                                alt={photo.event_name + photo.id}
                            />
                        </div>
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
