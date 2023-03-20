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
    count: number;
    returned: number;
    pages: number;
    photos: ImageData[];
}

const PublicGallery = (props: ResponseData) => {
    const { photos: initialPhotos } = props;
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
    const hasReachedEnd = data && data[data.length - 1]?.length < data[0]?.returned;
    const loadingMore = data && typeof data[size - 1] == 'undefined'

    if (isLoading || !paginatedPhotos) return <div></div>
    return (
        <>
            <Head>
                <title>{'HYPNO® Presents: ' + galleryTitle || 'Hypno'}</title>
                <meta name="description" content="Taken with HYPNO: The animated, social photo booth" />
            </Head>

            <GalleryNavBar name={galleryTitle} gallerySlug={String(gallerySlug)}>
                <div className='flex flex-row gap-3 items-center text-lg invisible'>
                    <Link href={'/'}>Newest</Link>
                    <Link href={'/'}>Oldest</Link>
                </div>
            </GalleryNavBar>
            <section className={`text-white bg-black min-h-screen border-t-white/20 border-solid border-t-[1px]`}>
                <InfiniteScroll
                    next={() => setSize(size + 1)}
                    hasMore={!hasReachedEnd}
                    loader={<div className='w-full flex justify-center h-[100px] mb-8'><Spinner /></div>}
                    endMessage={<p>Reached the end</p>}
                    dataLength={paginatedPhotos?.length}
                >
                    <div className={`sm:mx-auto block h-full my-[35px] xl:px-[90px] mb-[35px]`}>
                        <FadeIn
                            from="bottom" positionOffset={300} triggerOffset={0}>
                            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
                                <Masonry gutter={'20px'} >
                                    {paginatedPhotos.map((p) => (
                                        <Link key={p.id} href={`/i/${p.slug}`}>
                                            <div className='w-full block relative bg-white/10 backdrop-blur-[50px] overflow-hidden' style={{ aspectRatio: getAspectRatio(p.width, p.height)}} >
                                                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                                                    <Spinner />
                                                </div>
                                                <div className='hover:scale-110 transition'>
                                                    <AutosizeImage
                                                        src={p.posterframe}
                                                        alt={p.event_name + p.id}
                                                        width={p.width}
                                                        height={p.height}
                                                    />
                                                    {p.gif && (
                                                        <div
                                                            className='absolute top-0 left-0 w-full h-full animate-jpeg-strip'
                                                            style={{ backgroundImage: `url(${p.jpeg_url})`, backgroundSize: '100% 500%' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </Masonry>
                            </ResponsiveMasonry>
                        </FadeIn>
                    </div>
                </InfiniteScroll>

            </section>
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
                destination: '/p/'+data.event.party_slug,
                permanent: false,
            }
        }
    }

    // Request to get photos for gallery
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${gallerySlug}/photos.json`;
    let resp = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    });
    let data = await resp.data;
    if (!data) return { notFound: true }
    return {
        props: {
            ...data,
        }
    }
};

export default PublicGallery;
