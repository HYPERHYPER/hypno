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
import { convertFieldObjectToArray } from '@/helpers/event';
import { getCookie, setCookie } from 'cookies-next';

type ImageData = {
    id: number;
    event_id: number;
    slug: string;
    url: string;
    posterframe: string;
    mp4_url: string;
    ipad_id: number;
    uploaded: string;
    updated_at: string;
    moderated: boolean;
    captured_at: string;
    format_generation: string; //(actually a number in quotes)
    download_url: string;
    metadata: Object; // need to type?
    width: number;
    height: number;
    has_raw_asset: boolean;
    raw: string;
    raw_url: string;
    urls: {
        url: string;
        jpeg_url: string;
        jpeg_thumb_url: string;
        jpeg_3000_thumb_url: string;
        posterframe: string;
        mp4_url: string;
        gif: string;
    }
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
    
    const gallery: EventMicrosite = event.custom_frontend;
    const { query: { category, eventId: eventIdOrSlug, event: galleryViewSlug } } = useRouter()
    const eventSlug = event.party_slug;
    const token = String(getCookie('hypno_microsite'));

    const [photoUploadPending, setPhotoUploadPending] = useState<boolean>(true); // waiting for first photo to arrive
    const [photoUploadCompleted, setPhotoUploadCompleted] = useState<boolean>(false);
    const photoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventIdOrSlug}/photos/index_from_category?category=${category}`;
    const { data, error } = useSWR(category ? [photoUrl, token] : null,
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
    const fields = gallery.email_delivery ? [{ id: 'email', name: 'email', required: true, type: 'email' }] : _.map(convertFieldObjectToArray(gallery.fields), (f) => {
        // const required = _.endsWith(f.name,'*');
        return { id: f.name.toLowerCase().replaceAll(" ", "_"), ...f }
    });

    const showBrowseGalleryBanner = event.is_private == 1 && event.event_type == 'hypno_pro' && (isDetailView || (!dataCapture && !gallery.email_delivery));
    
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

    const detailViewConfig = {
        ai_generation: event?.metadata?.ai_generation, 
        color: gallery.primary_color, 
        qr_asset_download: event?.metadata?.qr_asset_download,
        displayFileType: event?.filetype_download,
        watermarks: event?.event_filter_watermarks,
        watermarkBlendmode: event?.metadata?.blendmode,
        rawEnabled: event?.metadata?.pro_raw_upload, // if raw is enabled, apply watermark
    }

    return (
        <>
            <Head>
                <title>{event.name + ' | hypno™' || 'hypno™'}</title>
                <meta name="description" content="" />
                <meta name="og:image" content={photo ? photo.urls.posterframe : _.first(photos)?.urls.posterframe} />                
                <meta name="og:image:type" content='image/jpeg' />
                <meta name="og:video" content={photo ? photo.urls.mp4_url : _.first(photos)?.mp4_url} />
                <meta name="og:video:type" content='video/mp4' />
            </Head>

            <CustomGallery event={event} galleryBanner={showBrowseGalleryBanner} defaultBackground={isDetailView ? photo.posterframe : _.first(photos)?.posterframe}>
                {isDetailView ? (
                    <DetailView asset={photo} config={detailViewConfig} imageProps={{ ...placeholder?.img }} />
                ) : (
                    <div
                        style={{ height: outerHeight }}
                        className={`sm:mx-auto h-[calc(100vh-85px-env(safe-area-inset-bottom))] w-full`}>
                        {(!photos.length && !gallery.email_delivery) ? (
                            <div className='fixed hero top-0 left-0 h-screen p-10'>
                                <div className='hero-content max-w-[24rem] sm:max-w-2xl flex flex-row gap-4 items-center justify-center bg-black/20 backdrop-blur-[50px] p-8'>
                                    <Spinner />
                                    <div>
                                        <p className='text-white'>your content is processing</p>
                                        <p className='text-white/50'>this usually takes 60 seconds</p>
                                    </div>
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
                                    color={gallery.primary_color}
                                    onSuccess={() => setDataCapture(false)}
                                />
                            ) : (!singleAsset && _.size(photos) > 1) ? (
                                <div className='sm:max-w-2xl md:max-w-6xl block mx-auto h-full flex-1 w-full px-6'>
                                    {/* <FadeIn from="bottom" positionOffset={0} triggerOffset={0}> */}
                                        <ResponsiveMasonry columnsCountBreakPoints={{ 750: 2, 900: 3 }} className='pb-8'>
                                            <Masonry gutter='15px'>
                                                {photos.map((p, i) => (
                                                    <Link key={p.id} href={`/${galleryViewSlug}/${eventSlug}?i=${p.slug}`}>
                                                        <div className='w-full block relative bg-white/10 backdrop-blur-[50px] overflow-hidden'>
                                                            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                                                                <Spinner />
                                                            </div>
                                                            <div className='transition'>
                                                                <img
                                                                    src={p.urls.gif ? p.urls.posterframe : p.urls.url}
                                                                    alt={`${p.event_id}-${p.id}`}
                                                                    className='object-cover'
                                                                />
                                                                {p.urls.gif &&
                                                                    <div
                                                                        className='absolute top-0 left-0 w-full h-full animate-jpeg-strip'
                                                                        style={{ backgroundImage: `url(${p.urls.jpeg_url})`, backgroundSize: '100% 500%' }}
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
                                    {/* </FadeIn> */}
                                </div>
                            )
                                : (
                                    gallery.email_delivery ? (
                                        <SingleAssetDeliveryConfirmation />
                                    ) : (
                                        <DetailView asset={_.first(photos)} config={detailViewConfig} imageProps={{ ...placeholder?.img, blurDataURL: placeholder?.base64, width: _.first(photos)?.width, height: _.first(photos)?.height }} />
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
    const { req, res } = context;
    const { event, eventId : eventIdOrSlug, category, i: photoSlug, slug: deliverySlug } = context.query;

    let eventData: any = {};
    let photosData: any = {};
    let singleAssetData: any = {};
    let token = '';

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
        token = tokenRes.data?.access_token;
        setCookie('hypno_microsite', token, { req, res });

        // Load custom frontend based on event
        if (!_.isNil(eventIdOrSlug)) {
            const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventIdOrSlug}/custom_frontend`;
            let eventRes = await axios.get(eventUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            });
            eventData = eventRes.data?.event;
        }

        // Fetch subset of photos to be displayed in subgallery
        if (category) {
            const photosUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventIdOrSlug}/photos/index_from_category?category=${category}`;
            let photosRes = await axios.get(photosUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            })
            photosData = photosRes.data;
        }

        // Fetch single asset for detail view or for single asset delivery
        if (photoSlug || deliverySlug) {
            let slug = photoSlug || deliverySlug;
            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/photos/${slug}/custom_frontend_show`;
            const res = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            });
            singleAssetData = res.data;
            if (photoSlug) {
                const placeholder = await getPlaiceholder(res.data.photo.urls.url);
                singleAssetData = {
                    ...singleAssetData,
                    placeholder
                };
            }
        }
    } catch (e) {
        console.log(e)
        if (_.isEmpty(eventData) || (photoSlug && _.isEmpty(singleAssetData)) || (deliverySlug && _.isEmpty(singleAssetData))) {
            return {
                notFound: true
            }
        }
    }

    return {
        props: {
            ...photosData,
            ...singleAssetData,
            event: {
                name: eventData.name,
                id: eventData.id,
                party_slug: eventData.party_slug,
                is_private: eventData.is_private,
                metadata: eventData.metadata || {},
                event_type: eventData.event_type || '',
                filetype_download: eventData.filetype_download || '',
                event_filter_watermarks: eventData.event_filter_watermarks || [],
                custom_frontend: {
                    ...(eventData.custom_gallery_assigned == '1' && { ...eventData.custom_frontend }),
                    ...(deliverySlug && { email_delivery: true })
                }
            }
        }
    }
};

export default SubGallery;
