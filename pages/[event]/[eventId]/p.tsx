import { useRouter } from 'next/router';
import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import _ from 'lodash';
import useSWRInfinite from 'swr/infinite';
import { fetchWithToken } from '@/lib/fetchWithToken';
import { CustomGallery } from '@/components/Gallery/CustomGallery';
import InfiniteMediaGrid from '@/components/Gallery/InfiniteMediaGrid';
import { EventConfig } from '@/types/event';
import { getPlaiceholder } from 'plaiceholder';

type PhotosResponse = {
    photos: any;
    meta: {
        total_count: number,
        next_page?: string,
        per_page?: number,
    }
}

interface ResponseData {
    event: EventConfig;
    photos: PhotosResponse;
}

const PublicGallery = (props: ResponseData) => {
    const { query } = useRouter();
    const { photos, event } = props;
    const { name, id } = event;

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData?.meta.next_page) return null; // reached the end
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${query.eventId}/photos?per_page=${photos.meta.per_page}`;
        if (pageIndex === 0) return [url, process.env.NEXT_PUBLIC_AUTH_TOKEN];
        return [`${previousPageData.meta.next_page}`, process.env.NEXT_PUBLIC_AUTH_TOKEN];
    }

    const { data, size, setSize, error, isValidating } = useSWRInfinite(getKey,
        ([url, token]) => fetchWithToken(url, token), {
        fallbackData: [{ photos }],
    });

    const paginatedPhotos = !_.isEmpty(_.first(data)?.photos) ? _.map(data, (v) => v.photos).flat() : [];
    const hasMorePhotos = size != (_.first(data)?.meta?.total_pages || 0);

    if (!paginatedPhotos) return <div></div>
    return (
        <>
            <Head>
                <title>{name + ' | hypno™' || 'hypno™'}</title>
                <meta name="description" content="Taken with HYPNO: The animated, social photo booth" />
            </Head>

            <CustomGallery event={event}>
                <section className={`text-white mt-3 sm:mt-8 mb-[35px] lg:px-[90px]`}>
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
    const { eventId } = context.query;
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;

    // Fetch event config + event photos
    const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}`;
    const photosUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}/photos?per_page=12`;
    let eventData: any = {};
    let photosData: any = {};

    try {
        const [eventRes, photosRes] = await Promise.all([
            axios.get(eventUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                }
            }),
            axios.get(photosUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                }
            })
        ])

        if (eventRes.status === 200) {
            eventData = eventRes.data;
        }

        if (photosRes.status === 200) {
            const photos = await Promise.all(
                photosRes.data.photos.map(async (photo: any) => {
                    const placeholder = await getPlaiceholder(photo.posterframe);
                    return {
                        ...photo,
                        blurDataURL: placeholder.base64,
                    };
                })
            );
            photosData = { ...photosRes.data, photos };
        }
    } catch (e) {
        console.log(e);
    }

    if (_.isEmpty(eventData)) {
        return {
            notFound: true,
        }
    }

    // Event is not public if is_private !== 1
    // @ts-ignore
    if (eventData.event.is_private != 1) {
        return { notFound: true, }
    }

    return {
        props: {
            ...eventData,
            photos: {
                ...photosData,
            }
        }
    };
};

export default PublicGallery;
