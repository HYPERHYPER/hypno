import { useRouter } from 'next/router';
import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toTextColor } from '@/helpers/color';
import Spinner from '@/components/Spinner';
import useSWR from 'swr';
import { axiosGetWithToken } from '@/lib/fetchWithToken';
import { FadeIn } from 'react-slide-fade-in';
import Image from 'next/image';
import AutosizeImage from '@/components/AutosizeImage';
import { parseLink } from '@/helpers/text';
import DetailView from '@/components/Gallery/DetailView';
import Link from 'next/link';
import Head from 'next/head';
import _ from 'lodash';

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
    mp4_url: string;
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
    count: number;
    returned: number;
    pages: number;
    photos: ImageData[];
    event: EventData;
    photo: ImageData;
}


const SubGallery = (props: ResponseData) => {
    const { event, photos: initialPhotos, count, photo } = props;
    const { query: { category, eventId, event: gallerySlug } } = useRouter()

    const [photoUploadPending, setPhotoUploadPending] = useState<boolean>(true); // waiting for first photo to arrive
    const [photoUploadCompleted, setPhotoUploadCompleted] = useState<boolean>(false);
    const photoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${eventId}/${category}/photos.json`;
    const { data, error } = useSWR([photoUrl, process.env.NEXT_PUBLIC_AUTH_TOKEN],
        ([url, token]) => axiosGetWithToken(url, token),
        {
            fallbackData: { photos: initialPhotos },
            refreshInterval: (photoUploadCompleted && !photoUploadPending) ? 0 : 1000
        })
    let photos: ImageData[] = data?.photos || [];
    const singleAsset: ImageData | null = event.email_delivery ? (_.first(data?.photos) || null) : null;
    const isDetailView = !_.isEmpty(photo);

    const expectedPhotoUploads = _.get(_.first(photos)?.metadata, 'category_count') || count;
    const uploadingCount = expectedPhotoUploads - photos.length;
    useEffect(() => {
        setPhotoUploadPending(_.isEmpty(photos));
        setPhotoUploadCompleted(expectedPhotoUploads == photos.length);
    }, [photos, expectedPhotoUploads])

    /* Setting up the data capture form for the gallery. */
    const [dataCapture, setDataCapture] = useState<boolean>(event.data_capture_screen || event.email_delivery);
    const fields = _.map(event.fields, (f) => ({ id: f.toLowerCase().replaceAll(" ", "_"), name: f }));
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    let acceptTermsRef = useRef<HTMLInputElement>(null);

    const submitDataCapture = async (data: any) => {
        const userAcceptedTerms = acceptTermsRef?.current?.checked;
        if (!_.isEmpty(errors) || !userAcceptedTerms) {
            console.log("submitDataCapture errors", { errors });
            console.log("acceptTerms", acceptTermsRef?.current?.checked);
            return;
        }

        console.log("submitDataCapture", { data });

        /* Save data capture to metadata field of first photo in category */
        const photoSlug = _.first(photos)?.slug;
        let metadata = _.first(photos)?.metadata || {};
        metadata = {
            ...metadata,
            ...data,
        }

        const url = event.email_delivery ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/photos/deliver/${photoSlug}.json` : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/photos/${photoSlug}.json`;
        const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
        const payload = event.email_delivery ? { email: data.email } : { metadata };
        let resp = await axios.put(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        });

        setDataCapture(false);
    }

    // No photos uploaded: loading view
    // All photos uploaded + data capture required: data capture -> gallery
    // Atleast 1 photo uploaded with more uploading + data capture: data capture -> gallery w loading images
    // Photos uploaded + no data cap: gallery
    return (
        <>
            <Head>
                <title>{event.name || 'HYPNO'}</title>
                <meta name="description" content="" />
            </Head>

            <section
                className={`text-white bg-black min-h-screen p-10 ${!_.isEmpty(event.logo) && 'pt-0'}`}
                style={event.background ? {
                    background: `url(${event.background}) no-repeat center center fixed`,
                    backgroundSize: 'cover',
                    WebkitBackgroundSize: 'cover',
                    //@ts-ignore
                    '-moz-background-size': 'cover',
                    '-o-background-size': 'cover'
                } : {}}>

                <div className='min-h-[50px] translate-y-1/2'>
                    <div className='flex justify-center'>
                        <Image className='h-auto' src={event.logo ? event.logo : 'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={event.name + " logo"} width={150} height={150} priority />
                    </div>
                </div>

                {isDetailView ? (
                    <div className='text-white mt-8'>
                        <DetailView asset={photo} config={{ aiGeneration: event.ai_generation }} />
                    </div>
                ) : (
                    <div className={`sm:mx-auto h-full ${_.isEmpty(event.logo) ? 'mt-8' : ''}`}>
                        {!photos.length ? (
                            <div className='fixed hero top-0 left-0 h-screen p-10'>
                                <div className='hero-content max-w-[24rem] sm:max-w-2xl flex flex-row gap-4 items-center justify-center bg-white/10 backdrop-blur-[50px] p-8'>
                                    <Spinner />
                                    <p className='text-white/20'>Your photos are processing, come back later...</p>
                                </div>
                            </div>
                        ) : (
                            dataCapture ? (
                                <div className='fixed hero top-0 left-0 h-screen'>
                                    <div className='hero-content max-w-[24rem] sm:max-w-2xl p-10'>
                                        <div className='flex flex-col'>
                                            <div className='mb-4'>
                                                <h2>{event.data_capture_title || 'Want your photos?'}</h2>
                                                <h2 className='text-gray-400'>{event.data_capture_subtitle || 'Add your info to continue...'}</h2>
                                            </div>
                                            <form onSubmit={handleSubmit(submitDataCapture)} className='space-y-2 flex flex-col'>
                                                {fields?.map((v, i) => (
                                                    <input
                                                        className={`input data-capture ${errors[v.id] && 'error text-red-600'}`}
                                                        placeholder={`${v.name}${errors[v.id] ? (errors[v.id]?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                                        key={i}
                                                        {...register(v.id, {
                                                            required: true,
                                                            ...(v.id == 'email' && { pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/ }),
                                                            ...(v.id == 'age' && { pattern: /^[0-9]*$/ })
                                                        })}
                                                    />
                                                ))}
                                                <div className='flex flex-row items-start gap-3 p-3 bg-black/10 backdrop-blur-[50px]'>
                                                    <input type="checkbox" className="checkbox checkbox-[#FFFFFF]" ref={acceptTermsRef} />
                                                    <p className='text-xs text-gray-400'>
                                                        {parseLink(event.terms_and_conditions, [{ text: 'Terms of Use', url: 'https://hypno.com/app/terms' }, { text: 'Privacy Policy', url: 'https://hypno.com/privacy' }])}
                                                    </p>
                                                </div>
                                                <input className='btn btn-primary' type='submit' value='GO' style={event.color ? { backgroundColor: event.color, borderColor: event.color, color: toTextColor(event.color) } : {}} />
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='sm:max-w-2xl md:max-w-6xl block mx-auto h-full'>
                                    <div className='mb-4'>
                                        <h2>{event.gallery_title || 'Share and tag all over social.'}</h2>
                                        <h2 className='text-gray-400 whitespace-pre-line'>{event.gallery_subtitle || '#hypno #pro #iphone'}</h2>
                                    </div>
                                    {!singleAsset ? (
                                        <FadeIn
                                            from="bottom" positionOffset={300} triggerOffset={0}>
                                            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
                                                <Masonry gutter='15px'>
                                                    {photos.map((p) => (
                                                        <Link key={p.id} href={`/${gallerySlug}/${eventId}?i=${p.slug}`}>
                                                            <div className='w-full block relative bg-white/10 backdrop-blur-[50px] cursor'>
                                                                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                                                                    <Spinner />
                                                                </div>
                                                                <AutosizeImage
                                                                    src={p.jpeg_url}
                                                                    alt={p.event_name + p.id}
                                                                />
                                                            </div>
                                                        </Link>
                                                    ))}
                                                    {_.range(0, uploadingCount).map((v, i) => (
                                                        <div key={i} className='bg-white/10 backdrop-blur-[50px] px-3 py-6 flex flex-col gap-3 justify-center items-center aspect-[4/3]'>
                                                            <Spinner />
                                                        </div>
                                                    ))}
                                                </Masonry>
                                            </ResponsiveMasonry>
                                        </FadeIn>
                                    ) : (
                                        <DetailView asset={singleAsset} />
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </section>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { event, eventId, category, i: photoSlug } = context.query;

    // Load theme interface based on event
    const isDefault = String(event) === 'pro';
    const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${eventId}.json`;
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    let eventRes = await axios.get(eventUrl, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    });
    let eventData = await eventRes.data?.event;

    // Fetch subset of photos to be displayed in subgallery
    let photosData = {}
    if (category) {
        const photoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${eventId}/${category}/photos.json`;
        let resp = await axios.get(photoUrl, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        });
        photosData = await resp.data;
    }

    // Fetch single asset for detail view
    let singleAssetData = {}
    if (photoSlug) {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/photos/${photoSlug}.json`;
        let resp = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        });
        singleAssetData = await resp.data;
    }

    return {
        props: {
            ...photosData,
            ...singleAssetData,
            event: isDefault ? {} : {
                name: eventData.name,
                id: eventData.id,
                ...eventData.metadata,
                terms_and_conditions: eventData.terms_and_conditions,
            }
        }
    }
};

export default SubGallery;
