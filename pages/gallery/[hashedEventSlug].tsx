import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import _ from 'lodash';
import useSWRInfinite from 'swr/infinite';
import { fetchWithToken } from '@/lib/fetchWithToken';
import { CustomGallery } from '@/components/Gallery/CustomGallery';
import InfiniteMediaGrid from '@/components/Gallery/InfiniteMediaGrid';
import { EventConfig } from '@/types/event';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import LoadingView from '@/components/LoadingView';


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

interface PhotosResponse {
    photos: ImageData[];
    meta: {
        total_count: number,
        next_page?: string,
        per_page?: number,
    }
}

interface ResponseData {
    event: EventConfig;
}

const PublicGallery = (props: ResponseData) => {
    const { event } = props;
    const { name, id } = event;
    const { query } = useRouter();
    const eventSlug = query.hashedEventSlug;

    if (!eventSlug) {
        return <LoadingView />; // Or some loading indicator
    }

    const galleryTitle = event.name;

    const getKey = useMemo(() => (pageIndex: number, previousPageData: any) => {
        if ((_.isNil(previousPageData) && pageIndex > 0) || (previousPageData && !previousPageData?.meta?.next_page)) return null;
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventSlug}/photos?per_page=30`;
        if (pageIndex === 0) return [url, process.env.NEXT_PUBLIC_AUTH_TOKEN];
        return [`${previousPageData?.meta?.next_page}`, process.env.NEXT_PUBLIC_AUTH_TOKEN];
    }, [eventSlug]);

    const { data, size, setSize, error, isLoading } = useSWRInfinite(getKey,
        ([url, token]) => fetchWithToken(url, token), {
        fallbackData: [{ photos: [] }],
    });

    const paginatedPhotos = !_.isEmpty(_.first(data).photos) ? _.map(data, (v) => v.photos).flat() : [];
    const hasMorePhotos = size != (_.first(data)?.meta?.total_pages || 0);

    if (!paginatedPhotos) return <div></div>
    return (
        <>
            <Head>
                <title>{galleryTitle + ' | hypno™' || 'hypno™'}</title>
                <meta name="description" content="Taken with HYPNO: The animated, social photo booth" />
            </Head>

            <CustomGallery event={event} defaultBackground={_.first(paginatedPhotos)?.urls?.url}>
                <section className={`text-white px-[25px] mt-3 sm:mt-8 mb-[35px] lg:px-[90px]`}>
                    <InfiniteMediaGrid
                        next={() => setSize(size + 1)}
                        assets={paginatedPhotos}
                        data={data}
                        hasMore={hasMorePhotos}
                        detailBaseUrl={`/pro/${event.id}?i=`}
                    />
                </section>
            </CustomGallery>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { hashedEventSlug } = context.params || {};
    console.log("Query:", context.query);
    console.log("Params:", context.params);

    if (!hashedEventSlug || hashedEventSlug === 'undefined') {
        return {
            notFound: true,
        }
    }

    // Fetch event config
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(hashedEventSlug)}`;
    let eventData: any = {};

    try {
        const eventRes = await axios.get(eventUrl, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            }
        });

        if (eventRes.status === 200) {
            eventData = eventRes.data;
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (_.isEmpty(eventData)) {
            return {
                notFound: true,
            }
        }
    }

    return {
        props: {
            ...eventData,
        }
    };
};

export default PublicGallery;
