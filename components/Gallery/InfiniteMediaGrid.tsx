import InfiniteScroll from "react-infinite-scroll-component";
import AutosizeImage from "../AutosizeImage";
import Spinner from "../Spinner";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Link from "next/link";
import { getAspectRatio } from "@/helpers/image";

type AssetData = {
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
    mp4_url: string;
    urls: {
        jpeg_url: string;
        jpeg_thumb_url: string;
        jpeg_3000_thumb_url: string;
        posterframe: string;
        gif: string;
    }
};

interface InfiniteMediaGridProps {
    next: () => void;
    data?: any[];
    assets: AssetData[];
    hasMore: boolean;
    detailBaseUrl: string;
}
export default function InfiniteMediaGrid({ next, data, assets, hasMore, detailBaseUrl }: InfiniteMediaGridProps) {
    return (
        <InfiniteScroll
            next={next}
            hasMore={hasMore}
            loader={<></>}
            scrollThreshold={0.45}
            endMessage={<div></div>}
            dataLength={assets?.length}
            scrollableTarget='custom-gallery-parent'
        >
            <MediaGrid assets={assets} detailBaseUrl={detailBaseUrl} />
        </InfiniteScroll>
    )
}

export const MediaGrid = ({ assets, detailBaseUrl }: { assets: AssetData[]; detailBaseUrl: string; }) => {
    return (
        <ResponsiveMasonry columnsCountBreakPoints={assets?.length < 4 ? { 375: 2, 750: 2, 900: 2 } : { 375: 3, 750: 2, 900: 3, 1200: 4 }}>
            <Masonry gutter={'10px'} >
                {assets.map((p, i) => {
                    if (!p.posterframe) return null;
                    return (
                    <Link key={i} href={`${detailBaseUrl}${p.slug}`}>
                        <div className='w-full block relative bg-white/10 backdrop-blur-[50px] overflow-hidden' style={{ aspectRatio: getAspectRatio(p.width, p.height) }} >
                            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                                <Spinner />
                            </div>
                            <div className='hover:scale-105 transition'>
                                <AutosizeImage
                                    src={p.posterframe}
                                    alt={`${p.event_id}-${p.id}`}
                                    width={p.width}
                                    height={p.height}
                                    priority={i < 11}
                                    sizes="(max-width: 600px) 100vw, 50vw"
                                />
                                {p.gif || p.mp4_url &&
                                    <div
                                        className='absolute top-0 left-0 w-full h-full animate-jpeg-strip'
                                        style={{ backgroundImage: `url(${p.urls.jpeg_url})`, backgroundSize: '100% 500%' }}
                                    />
                                }
                            </div>
                        </div>
                    </Link>
                )})}
            </Masonry>
        </ResponsiveMasonry>
    )
}