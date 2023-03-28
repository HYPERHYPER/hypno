import { useRouter } from 'next/router';
import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useState, useRef, useEffect, useMemo } from 'react';
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
import { getPlaiceholder } from 'plaiceholder';
import { CustomGallery } from '@/components/Gallery/CustomGallery';
import Letter from '../../../public/pop/letter.svg';

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
    email_delivery: boolean;
    ai_generation: any;
    party_slug: string;
    public_gallery: boolean;
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
    placeholder: any;
}

const SubGallery = (props: ResponseData) => {
    const { event, photos: initialPhotos, count, photo, placeholder } = props;
    const { query: { category, eventId, event: galleryViewSlug } } = useRouter()

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
    const singleAsset: ImageData | null = photo;
    const isDetailView = !_.isEmpty(photo) && !event.email_delivery;

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
    // let acceptTermsRef = useRef<HTMLInputElement>(null);

    const submitDataCapture = async (data: any) => {
        // const userAcceptedTerms = acceptTermsRef?.current?.checked;
        const userAcceptedTerms = true;
        if (!_.isEmpty(errors) || !userAcceptedTerms) {
            console.log("submitDataCapture errors", { errors });
            // console.log("acceptTerms", acceptTermsRef?.current?.checked);
            return;
        }

        console.log("submitDataCapture", { data });

        /* Save data capture to metadata field of first photo in category */
        /* unless is just email delivery */
        const photoSlug = event.email_delivery ? photo.slug : _.first(photos)?.slug;
        let metadata = event.email_delivery ? photo.metadata : _.first(photos)?.metadata || {};
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

    /* MINI GALLERY ?category= */
    // No photos uploaded: loading view
    // All photos uploaded + data capture required: data capture -> gallery
    // Atleast 1 photo uploaded with more uploading + data capture: data capture -> gallery w loading images
    // Photos uploaded + no data cap: gallery

    /* DETAIL VIEW ?i= */
    // 1. Single asset view

    /* SINGLE ASSET EMAIL DELIVERY ?slug= */
    // 1. Data capture
    // 2. Confirmation message
    return (
        <>
            <Head>
                <title>{event.name + ' | hypno™' || 'hypno™'}</title>
                <meta name="description" content="" />
                <meta name="og:image" content={photo ? photo.jpeg_3000_thumb_url : _.first(photos)?.jpeg_3000_thumb_url} />
                <meta name="og:image:type" content='image/jpeg' />
                <meta name="og:video" content={photo ? photo.mp4_url : _.first(photos)?.mp4_url} />
                <meta name="og:video:type" content='video/mp4' />
            </Head>

            <CustomGallery event={event}>
                {isDetailView ? (
                    <DetailView asset={photo} config={{ aiGeneration: event.ai_generation }} imageProps={{ ...placeholder?.img, blurDataURL: placeholder?.base64 }} />
                ) : (
                    <div className={`sm:mx-auto h-full`}>
                        {(!photos.length && !event.email_delivery) ? (
                            <div className='fixed hero top-0 left-0 h-screen p-10'>
                                <div className='hero-content max-w-[24rem] sm:max-w-2xl flex flex-row gap-4 items-center justify-center bg-white/10 backdrop-blur-[50px] p-8'>
                                    <Spinner />
                                    <p className='text-white/20'>Your photos are processing, come back later...</p>
                                </div>
                            </div>
                        ) : (
                            dataCapture ? (
                                <div className='h-[calc(100vh-85px-48px-30px)] overflow-auto flex items-center'>
                                    <div className='sm:max-w-2xl p-4 sm:p-10 mx-auto'>
                                        <div className='flex flex-col text-center'>
                                            <div className='mb-4'>
                                                <h2>{event.data_capture_title || 'want your photos?'}</h2>
                                                <h2 className='text-gray-400'>{event.data_capture_subtitle || 'add your info to continue...'}</h2>
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
                                                    {/* <input type="checkbox" className="checkbox checkbox-[#FFFFFF]" ref={acceptTermsRef} /> */}
                                                    <p className='text-xs text-gray-400'>
                                                        {parseLink(event.terms_and_conditions, [{ text: 'terms of use', url: 'https://hypno.com/app/terms' }, { text: 'privacy policy', url: 'https://hypno.com/privacy' }])}
                                                    </p>
                                                </div>
                                                <input className='btn btn-primary btn-gallery locked sm:block' type='submit' value='continue →' style={event.color ? { backgroundColor: event.color, borderColor: event.color, color: toTextColor(event.color) } : {}} />
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='sm:max-w-2xl md:max-w-6xl block mx-auto h-full'>
                                    {/* <div className='mb-4 flex flex-col justify-start items-start gap-3 sm:flex-row sm:justify-between sm:items-end'>
                                        <div>
                                            <h2>{event.gallery_title || 'Share and tag all over social.'}</h2>
                                            <h2 className='text-gray-400 whitespace-pre-line'>{event.gallery_subtitle || '#hypno #pro #iphone'}</h2>
                                        </div>
                                        {event.public_gallery && <Link href={`/${galleryViewSlug}/${eventId}/${event.party_slug}`} className='btn btn-sm rounded-full'>View all</Link>}
                                    </div> */}
                                    {!singleAsset ? (
                                        <FadeIn
                                            from="bottom" positionOffset={300} triggerOffset={0}>
                                            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
                                                <Masonry gutter='15px'>
                                                    {photos.map((p, i) => (
                                                        <Link key={p.id} href={`/${galleryViewSlug}/${eventId}?i=${p.slug}`}>
                                                            <div className='w-full block relative bg-white/10 backdrop-blur-[50px] overflow-hidden'>
                                                                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                                                                    <Spinner />
                                                                </div>
                                                                <div className='hover:scale-110 transition'>
                                                                    <AutosizeImage
                                                                        src={p.gif ? p.posterframe : p.jpeg_thumb_url}
                                                                        alt={p.event_name + p.id}
                                                                        width={p.width}
                                                                        height={p.height}
                                                                        priority={i < 11}
                                                                    />
                                                                    {p.gif &&
                                                                        <div
                                                                            className='absolute top-0 left-0 w-full h-full animate-jpeg-strip'
                                                                            style={{ backgroundImage: `url(${p.jpeg_url})`, backgroundSize: '100% 500%' }}
                                                                        />
                                                                    }
                                                                </div>
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
                                        event.email_delivery ? (
                                            <div className='fixed hero top-0 left-0 h-screen p-10'>
                                                <div className='hero-content max-w-[24rem] sm:max-w-2xl flex flex-row gap-4 items-center bg-white/10 backdrop-blur-[50px] p-8'>
                                                    <span className='flex-1'><Letter /></span>
                                                    <p className='text-white'>Thank you! <br /> Your content will be delivered to your email shortly.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <DetailView asset={singleAsset} config={{ aiGeneration: event.ai_generation }} imageProps={{ ...placeholder?.img, blurDataURL: placeholder?.base64 }} />
                                        )
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </CustomGallery>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { event, eventId, category, i: photoSlug, slug: deliverySlug } = context.query;

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

    // Fetch single asset for detail view or for single asset delivery
    let singleAssetData = {}
    if (photoSlug || deliverySlug) {
        let slug = photoSlug || deliverySlug;
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/photos/${slug}.json`;
        let resp = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        }).then(async (res) => {
            singleAssetData = res.data;
            if (photoSlug) {
                const placeholder = await getPlaiceholder(res.data.photo.jpeg_url);
                singleAssetData = {
                    ...singleAssetData,
                    placeholder
                }
            }
        });
    }

    if (deliverySlug && !eventData.metadata.email_delivery) {
        return {
            notFound: true
        }
    }
    return {
        props: {
            ...photosData,
            ...singleAssetData,
            event: {
                name: eventData.name,
                id: eventData.id,
                ...eventData.metadata,
                terms_and_conditions: eventData.terms_and_conditions,
                party_slug: eventData.party_slug,
            }
        }
    }
};

export default SubGallery;
