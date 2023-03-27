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
};

interface InfiniteMediaGridProps {
    next: () => void;
    data?: any[];
    assets: AssetData[];
}
export default function InfiniteMediaGrid({ next, data, assets }: InfiniteMediaGridProps) {
    const hasReachedEnd = data && data[data.length - 1]?.length < data[0]?.returned;

    return (
        <InfiniteScroll
            next={next}
            hasMore={!hasReachedEnd}
            loader={<div className='w-full flex justify-center h-[100px] mb-8'><Spinner /></div>}
            endMessage={<p>Reached the end</p>}
            dataLength={assets?.length}
        >
            <MediaGrid assets={assets} />
        </InfiniteScroll>
    )
}

export const MediaGrid = ({ assets }: { assets: AssetData[] }) => {
    return (
        <div className={`sm:mx-auto block h-full my-[35px] xl:px-[90px] mb-[35px]`}>
            <ResponsiveMasonry columnsCountBreakPoints={{ 375: 3, 750: 2, 900: 3, 1200: 4 }}>
                <Masonry gutter={'10px'} >
                    {assets.map((p, i) => (
                        <Link key={p.id} href={`/i/${p.slug}`}>
                            <div className='w-full block relative bg-white/10 backdrop-blur-[50px] overflow-hidden' style={{ aspectRatio: getAspectRatio(p.width, p.height) }} >
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
                </Masonry>
            </ResponsiveMasonry>
        </div>
    )
}