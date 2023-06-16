import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Link from 'next/link';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import nookies from 'nookies'
import Image from 'next/image'
import Trash from 'assets/icons/trash.svg'
import Hide from 'assets/icons/hide.svg'
import Favorite from 'assets/icons/favorite.svg'
import FavoriteFilled from 'assets/icons/favoriteFilled.svg'
import Share from 'assets/icons/share.svg'
import Save from 'assets/icons/save.svg'
import Play from 'assets/icons/play.svg'
import { getPlaiceholder } from 'plaiceholder';
import useSWRInfinite from 'swr/infinite';
import { fetchWithToken } from '@/lib/fetchWithToken';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingGrid } from '@/components/Gallery/LoadingAsset';
import { useRouter } from 'next/router';
import ScanQRModal from '@/components/Events/ScanQRModal';
import Modal from '@/components/Modal';
import useAssetManager from '@/hooks/useAssetManager';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import Spinner from '@/components/Spinner';

type PhotosResponse = {
    photos: any;
    meta: {
        total_count: number,
        next_page?: string,
        per_page?: number,
    }
}

interface ResponseData {
    event: any;
    photos: PhotosResponse;
}

// function GridImage({ src, alt, priority }: { src: string, alt: string, priority?: boolean }) {
//     const [blurDataURL, setBlurDataURL] = useState<string>('');

//     useEffect(() => {
//         const getBlurDataUrl = async () => {
//             const res = await fetch(`/api/image?url=${src}`);
//             const placeholderData = await res.json();
//             setBlurDataURL(placeholderData.base64);
//         }

//         getBlurDataUrl();
//     }, [])

//     return (
//         <Image
//             className='absolute top-0 left-0 w-full h-full rounded-box object-cover'
//             priority={priority}
//             src={src}
//             fill
//             alt={alt}
//             placeholder={blurDataURL ? 'blur' : 'empty'}
//             blurDataURL={blurDataURL || undefined}
//         />
//     )
// }

const AdminAsset = ({ asset, onSuccess }: { asset?: any, onSuccess?: () => void; }) => {
    const {
        isFavorited,
        isHidden,
        archiveAsset,
        toggleFavorited,
        toggleHidden,
    } = useAssetManager(asset);

    const [archiveModal, setArchiveModal] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    return (
        <>
            <div className='group relative rounded-box bg-white/10 w-full aspect-[2/3] overflow-hidden'>
                <Link href={`/i/${asset.slug}`} className='absolute inset-0 hover:scale-110 transition rounded-box'>
                    {asset.posterframe && <Image
                        className='absolute top-0 left-0 w-full h-full rounded-box object-cover transition'
                        src={asset.posterframe}
                        fill
                        alt={`${asset.event_id}-${asset.id}` || ''}
                        placeholder={asset.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={asset.blurDataURL || undefined}
                        sizes="(min-width: 1280px) 20%, (min-width: 1024px) 25%, (min-width: 768px) 33.33%, 50vw"
                        onLoadingComplete={() => setIsLoaded(true)}
                        />
                    }
                    {asset.gif &&
                        <div
                            className='absolute top-0 left-0 w-full h-full animate-jpeg-strip'
                            style={{ backgroundImage: `url(${asset.jpeg_url})`, backgroundSize: '100% 500%' }}
                        />
                    }
                </Link>
                
                {!isLoaded && <div className='absolute inset-0 flex items-center justify-center'><Spinner /></div>}
                
                {archiveModal ? (
                    <div className='transition absolute inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-10'>
                        <div className='bg-black p-4 m-4 rounded-2xl'>
                            <h4 className='mb-3 text-center'>archive asset?</h4>
                            <div className='flex flex-row justify-between gap-2'>
                                <button className='btn btn-neutral btn-xs rounded-2xl flex-1' onClick={() => setArchiveModal(false)}>cancel</button>
                                <button className='btn btn-error btn-xs rounded-2xl flex-1' onClick={() => { archiveAsset(); setArchiveModal(false); onSuccess && onSuccess()}}>confirm</button>
                            </div>
                        </div>
                    </div>
                )
                    : (
                        <>
                            {(isHidden || isFavorited) &&
                                <div className='group-hover:opacity-0 transition absolute inset-0 bg-black/30 pointer-events-none flex items-center justify-center'>
                                    <span className='scale-[1.75] flex flex-row'>
                                        {isHidden && <Hide />}
                                        {isFavorited && <FavoriteFilled />}
                                    </span>
                                </div>
                            }

                            <div
                                style={{ background: '-webkit-linear-gradient(top, rgba(0,0,0,0.65), rgba(0,0,0,0))' }}
                                className='pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0 w-full h-full z-10 px-2 py-4 rounded-box'>
                                <div className='pointer-events-auto flex flex-row flex-wrap justify-between text-white gap-0.5 sm:gap-0'>
                                    <button className='cursor-pointer rounded-full hover:bg-white/10 transition p-2 hover:backdrop-blur-md' onClick={() => setArchiveModal(true)}><Trash /></button>
                                    <button className={clsx('rounded-full hover:bg-white/10 transition p-2 hover:backdrop-blur-md', isHidden && 'bg-white/10 backdrop-blur-md')} onClick={() => {toggleHidden();}}><Hide /></button>
                                    <button className={clsx('rounded-full hover:bg-white/10 transition p-2 hover:backdrop-blur-md', isFavorited && 'bg-white/10 backdrop-blur-md')} onClick={() => {toggleFavorited();}}>{isFavorited ? <FavoriteFilled /> : <Favorite />}</button>
                                    <a href={asset.download_url} className='cursor-pointer rounded-full hover:bg-white/10 transition p-2 hover:backdrop-blur-md'><Save /></a>
                                    <Link href={`/pro/${asset.event_id}?i=${asset.id}`} className='rounded-full hover:bg-white/10 transition p-2 hover:backdrop-blur-md'><Share /></Link>
                                </div>

                                {asset.gif && (
                                    <div className='absolute top-0 left-0 flex items-center justify-center h-full w-full'>
                                        <button><Play /></button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
            </div>
        </>
    )
}

const isProEvent = (eventType: string) => eventType === 'hypno_pro';

function EventPage(props: ResponseData) {
    const { query } = useRouter();
    const { event, photos } = props;
    const { name, id } = event;

    const token = useUserStore.useToken();

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData?.meta.next_page) return null; // reached the end
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${query.eventId}/photos?per_page=${photos.meta.per_page}`;
        if (pageIndex === 0) return [url, token.access_token];
        return [`${previousPageData.meta.next_page}`, token.access_token];
    }

    const { data, size, setSize, error, isValidating, mutate } = useSWRInfinite(getKey,
        ([url, token]) => fetchWithToken(url, token), {
        fallbackData: [{ photos }],
        revalidateAll: true,
    });

    const totalCount = (_.first(data)?.meta?.total_count || 0);
    const paginatedPhotos = !_.isEmpty(_.first(data).photos) ? _.map(data, (v) => v.photos).flat() : [];
    const hasMorePhotos = totalCount != paginatedPhotos?.length;

    const onArchive = useCallback((assetId: number) => {
        if (!_.isEmpty(data)) {
            const assetIndexToRemove = paginatedPhotos.findIndex(item => item.id === assetId);
            const assetPage = Math.floor(assetIndexToRemove / (photos?.meta?.per_page || 10));
            const photosToUpdate = data && data[assetPage].photos;
            const idxInPage = assetIndexToRemove % 10;
            const updatedPhotos = [...photosToUpdate.slice(0, idxInPage), ...photosToUpdate.slice(idxInPage + 1)];
            let updatedData = data || [];
            updatedData[0] = {...updatedData[0], meta: {...updatedData[0].meta, total_count: updatedData[0].meta.total_count - 1 }}
            updatedData[assetPage] = { photos: updatedPhotos, meta: updatedData[assetPage].meta };
            mutate(updatedData);
        }
    }, [data]);

    return (
        <>
            <Head>
                <title>{name} | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title={name}
                    right={
                        <Modal.Trigger id='scan-qr-modal'>
                            <div className='avatar placeholder'>
                                <div className="rounded-xl bg-white text-white w-[120px]">
                                    <img src={`https://pro.hypno.com/api/v1/events/${id}/short_qr_code.png`} alt='QR Code' />
                                </div>
                            </div>
                        </Modal.Trigger>
                    }
                >
                    <h2>{totalCount} posts</h2>
                    {/* <Link href={`/pro/${id}/p`}><h2 className='text-primary'>public gallery</h2></Link> */}
                    {/* <Link href={`/e/${id}`}><h2 className='text-white'>all</h2></Link> */}
                    {/* <Link href=''><h2 className='text-primary'>favorites</h2></Link> */}
                    {/* <Link href=''><h2 className='text-primary'>data</h2></Link> */}
                    {isProEvent(event.event_type) && <Link href={`/e/${id}/edit`}><h2 className='text-primary'>edit</h2></Link>}
                </GlobalLayout.Header>

                <ScanQRModal eventId={id} eventName={name} modalId='scan-qr-modal' />

                <GlobalLayout.Content>
                    <div className='divider' />
                    <InfiniteScroll
                        next={() => setSize((prev) => prev + 1)}
                        hasMore={hasMorePhotos}
                        dataLength={paginatedPhotos?.length}
                        loader={<></>}
                        scrollThreshold={0.45}
                    >
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-5 lg:grid-cols-4 lg:gap-10 xl:grid-cols-5 3xl:grid-cols-6'>
                            {_.map(paginatedPhotos, (p, i) => {
                                if (p.slug) {
                                    return <div key={i}><AdminAsset asset={p} onSuccess={() => onArchive(p.id)} /></div>
                                }
                            }
                            )}
                            {(isValidating && hasMorePhotos) && <LoadingGrid count={_.min([photos.meta.per_page || 0, totalCount]) || 0} />}
                        </div>
                    </InfiniteScroll>
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { eventId } = context.query;

    // Fetch event config + event photos
    const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}`;
    const photosUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}/photos`;
    const token = nookies.get(context).hypno_token;
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
            eventData = await eventRes.data;
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

    return {
        props: {
            ...eventData,
            photos: {
                ...photosData,
            }
        }
    };
};

export default withAuth(EventPage, 'protected');
