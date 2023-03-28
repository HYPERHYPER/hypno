import { useRouter } from 'next/router';
import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import Head from 'next/head';
import _ from 'lodash';
import Spinner from '@/components/Spinner';
import useSWRInfinite from 'swr/infinite';
import { fetchWithToken } from '@/lib/fetchWithToken';
import { FadeIn } from 'react-slide-fade-in';
import AutosizeImage from '@/components/AutosizeImage';
import GalleryNavBar from '@/components/Gallery/GalleryNavBar';
import Link from 'next/link';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getAspectRatio } from '@/helpers/image';
import { CustomGallery } from '@/components/Gallery/CustomGallery';
import InfiniteMediaGrid from '@/components/Gallery/InfiniteMediaGrid';

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
    email_delivery: boolean;
    ai_generation: any;
    metadata: any;
}

interface ResponseData {
    status: number;
    message: string;
    count: number;
    returned: number;
    pages: number;
    photos: ImageData[];
    event: EventData;
}

const PublicGallery = (props: ResponseData) => {
    const { photos: initialPhotos, event } = props;
    const { query: { gallerySlug } } = useRouter()

    const galleryTitle = _.first(initialPhotos)?.event_name || String(gallerySlug);

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && pageIndex == previousPageData.pages) return null; // reached the end
        let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${gallerySlug}/photos.json`
        if (pageIndex === 0) return [url, process.env.NEXT_PUBLIC_AUTH_TOKEN];
        const lastItemIdx = _.get(_.last(previousPageData?.photos), 'id') || _.last(initialPhotos)?.id;
        return [`${url}?key_id=${lastItemIdx}`, process.env.NEXT_PUBLIC_AUTH_TOKEN];
    }

    const { data, size, setSize, error, isLoading } = useSWRInfinite(getKey,
        ([url, token]) => fetchWithToken(url, token), {
        fallbackData: initialPhotos,
    });

    const paginatedPhotos = _.map(data, (v) => v.photos).flat();

    if (isLoading || !paginatedPhotos) return <div></div>
    return (
        <>
            <Head>
                <title>{galleryTitle + ' | hypno™' || 'hypno™'}</title>
                <meta name="description" content="Taken with HYPNO: The animated, social photo booth" />
            </Head>

            {/* <GalleryNavBar name={galleryTitle} gallerySlug={String(gallerySlug)}> */}
                {/* <div className='flex flex-row gap-3 items-center text-lg invisible'>
                    <Link href={'/'}>Newest</Link>
                    <Link href={'/'}>Oldest</Link>
                </div> */}
            {/* </GalleryNavBar> */}
            <CustomGallery event={event}>
                <section className={`text-white min-h-screen`}>
                    <InfiniteMediaGrid
                        next={() => setSize(size + 1)}
                        assets={paginatedPhotos}
                        data={data}
                    />
                </section>
            </CustomGallery>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { gallerySlug, order_by } = context.query;

    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;

    // handles case where event_id is passed as gallerySlug
    let reg = new RegExp(/^\d+$/);
    if (reg.test(String(gallerySlug))) {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${gallerySlug}.json`;
        let resp = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        });
        let data = await resp.data;
        if (!data) return { notFound: true }
        return {
            redirect: {
                destination: '/p/' + data.event.party_slug,
                permanent: false,
            }
        }
    }

    let eventData = {};
    let photosData = {};
    // Request to get photos for gallery
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${gallerySlug}/photos.json`;
    let resp = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    }).then(async (res) => {
        photosData = res.data;
        if (!photosData) return { notFound: true }

        //@ts-ignore
        const eventId: ImageData = _.first(res.data.photos)?.event_id;
        // Get event config for custom gallery
        const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${eventId}.json`;
        let eventRes = await axios.get(eventUrl, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        });
        eventData = await eventRes.data?.event.metadata;
    });

    return {
        props: {
            ...photosData,
            event: eventData,
        }
    }
};

export default PublicGallery;
