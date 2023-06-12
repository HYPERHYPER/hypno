import { useRouter } from 'next/router';
import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useState, useEffect } from 'react';
import Spinner from '@/components/Spinner';
import useSWR from 'swr';
import { axiosGetWithToken } from '@/lib/fetchWithToken';
import { FadeIn } from 'react-slide-fade-in';
import AutosizeImage from '@/components/AutosizeImage';
import DetailView from '@/components/Gallery/DetailView';
import Link from 'next/link';
import Head from 'next/head';
import _ from 'lodash';
import { getPlaiceholder } from 'plaiceholder';
import { CustomGallery } from '@/components/Gallery/CustomGallery';
import useContentHeight from '@/hooks/useContentHeight';
import { EventConfig, EventMicrosite } from '@/types/event';
import SingleAssetDeliveryConfirmation from '@/components/Microsite/SingleAssetDeliveryConfirmation';
import DataCaptureForm from '@/components/Microsite/DataCaptureForm';

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

interface ResponseData {
    status: number;
    message: string;
    count: number;
    returned: number;
    pages: number;
    photos: ImageData[];
    event: EventConfig;
    photo: ImageData;
    placeholder: any;
}

const SubGallery = (props: ResponseData) => {
    const outerHeight = useContentHeight({ footer: false });
    const contentHeight = useContentHeight({ footer: true });
    const { event, photos: initialPhotos, count, photo, placeholder } = props;
    const gallery: EventMicrosite = event.metadata;
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
    const isDetailView = !_.isEmpty(photo) && !gallery.email_delivery;

    const expectedPhotoUploads = _.get(_.first(photos)?.metadata, 'category_count') || count;
    const uploadingCount = expectedPhotoUploads - photos.length;
    useEffect(() => {
        setPhotoUploadPending(_.isEmpty(photos));
        setPhotoUploadCompleted(expectedPhotoUploads == photos.length);
    }, [photos, expectedPhotoUploads])

    /* Setting up the data capture form for the gallery. */
    const [dataCapture, setDataCapture] = useState<boolean>(gallery.data_capture || gallery.email_delivery);
    const fields = gallery.email_delivery ? [{ id: 'email', name: 'email' }] : _.map(gallery.fields, (f) => ({ id: f.toLowerCase().replaceAll(" ", "_"), name: f }));

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
                    <DetailView asset={photo} config={{ aiGeneration: gallery.ai_generation, color: gallery.color }} imageProps={{ ...placeholder?.img, blurDataURL: placeholder?.base64 }} />
                ) : (
                    <div
                        style={{ height: outerHeight }}
                        className={`sm:mx-auto h-[calc(100vh-85px-env(safe-area-inset-bottom))] w-full`}>
                        {(!photos.length && !gallery.email_delivery) ? (
                            <div className='fixed hero top-0 left-0 h-screen p-10'>
                                <div className='hero-content max-w-[24rem] sm:max-w-2xl flex flex-row gap-4 items-center justify-center bg-white/10 backdrop-blur-[50px] p-8'>
                                    <Spinner />
                                    <p className='text-white/50'>Your photos are processing, come back later...</p>
                                </div>
                            </div>
                        ) : (
                            dataCapture ? (
                                <DataCaptureForm
                                    title={gallery.data_capture_title}
                                    subtitle={gallery.data_capture_subtitle}
                                    fields={fields}
                                    enable_legal={gallery.enable_legal}
                                    explicit_opt_in={gallery.explicit_opt_in}
                                    terms_privacy={gallery.terms_privacy}
                                    email_delivery={gallery.email_delivery}
                                    asset={{
                                        slug: gallery.email_delivery ? photo.slug : _.first(photos)?.slug || '',
                                        metadata: gallery.email_delivery ? photo.metadata : _.first(photos)?.metadata || {}
                                    }}
                                    color={gallery.color}
                                    onSuccess={() => setDataCapture(false)}
                                />
                            ) : (!singleAsset && _.size(photos) > 1) ? (
                                <div className='sm:max-w-2xl md:max-w-6xl block mx-auto h-full flex-1 w-full px-6'>
                                    <FadeIn
                                        from="bottom" positionOffset={300} triggerOffset={0}>
                                        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }} className='pb-8'>
                                            <Masonry gutter='15px'>
                                                {photos.map((p, i) => (
                                                    <Link key={p.id} href={`/${galleryViewSlug}/${eventId}?i=${p.slug}`}>
                                                        <div className='w-full block relative bg-white/10 backdrop-blur-[50px] overflow-hidden'>
                                                            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                                                                <Spinner />
                                                            </div>
                                                            <div className='transition'>
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
                                                {uploadingCount > 0 && _.range(0, uploadingCount).map((v, i) => (
                                                    <div key={i} className='bg-white/10 backdrop-blur-[50px] px-3 py-6 flex flex-col gap-3 justify-center items-center aspect-[4/3]'>
                                                        <Spinner />
                                                    </div>
                                                ))}
                                            </Masonry>
                                        </ResponsiveMasonry>
                                    </FadeIn>
                                </div>
                            )
                                : (
                                    gallery.email_delivery ? (
                                        <SingleAssetDeliveryConfirmation />
                                    ) : (
                                        <DetailView asset={_.first(photos)} config={{ aiGeneration: gallery.ai_generation, color: gallery.color }} imageProps={{ ...placeholder?.img, blurDataURL: placeholder?.base64, width: _.first(photos)?.width, height: _.first(photos)?.height }} />
                                    )
                                ))
                        }
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
    const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventId}`;
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

    // if (deliverySlug && !eventData.metadata.email_delivery) {
    //     return {
    //         notFound: true
    //     }
    // }
    return {
        props: {
            ...photosData,
            ...singleAssetData,
            event: {
                name: eventData.name,
                id: eventData.id,
                party_slug: eventData.party_slug,
                is_private: eventData.is_private,
                metadata: {
                    ...eventData.metadata,
                    ...(deliverySlug && { email_delivery: true })
                }
            }
        }
    }
};

export default SubGallery;
