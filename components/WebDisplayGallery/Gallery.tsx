import _ from "lodash";
import { motion, AnimatePresence } from 'framer-motion';
import useWidth from "@/hooks/useWidth";
import { useEffect, useState } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";

const ImageAsset = ({ asset }: { asset?: any }) => {
    return (
        <img
            className="w-full h-auto"
            src={asset.urls.url}
            alt={`hypno-${asset.id}`}
        />
    )
}

const GifAsset = ({ asset }: { asset?: any }) => {
    return (
        <div className="relative w-full h-auto">
            <div
                className='absolute top-1/2 -translate-y-1/2 left-0 w-full animate-jpeg-strip'
                style={{
                    aspectRatio: asset.width / asset.height,
                    backgroundImage: `url(${asset.urls.jpeg_url})`,
                    backgroundSize: '100% 500%'
                }}
            />
        </div>
    )
}

const VideoAsset = ({ asset }: { asset?: any }) => {
    return (
        <video
            className="w-full h-auto"
            src={asset.mp4_url}
            autoPlay
            loop
            playsInline
            muted
            poster={asset.posterframe}
        />
    )
}

const AssetContainer = ({ asset, width, type, transitionDuration }: { asset?: any, width: number, type?: string, transitionDuration?: number }) => {
    return (
        <div className="relative flex h-screen w-screen items-center overflow-hidden bg-black" style={{ width: `calc[100vw - ${width}` }}>
            {asset && <AnimatePresence>
                <motion.div
                    key={asset.id}
                    initial={{ x: '-100%'}}
                    animate={{ x: 0, opacity: 100 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ duration: transitionDuration }}
                    className={`absolute flex h-screen w-full items-center justify-center`}
                >
                    {type == 'video' && <VideoAsset asset={asset} />}
                    {type == 'image' && <ImageAsset asset={asset} />}
                    {type == 'gif' && <GifAsset asset={asset} />}
                </motion.div>
            </AnimatePresence>
            }
        </div>
    )
}

export default function WebDisplayGallery({ assets, displayCount, assetType, transitionDuration }: {
    assets?: any,
    displayCount: number,
    assetType?: string,
    transitionDuration?: number
}) {
    const width = useWidth();
    const assetWidth = (width || window?.innerWidth) / displayCount;

    const placeholderCount = Math.max(displayCount - _.size(assets), 0); // if less assets exist than length of display row

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 100 }}
                transition={{ duration: 3 }}
                className="flex justify-center">
                {_.map(assets, (asset, i) => (
                    <AssetContainer
                        key={i}
                        asset={asset}
                        width={assetWidth}
                        type={assetType}
                        transitionDuration={transitionDuration}
                    />
                ))}
                {_.map(Array.from(Array(placeholderCount).keys()), (i) => (
                    <div
                        key={i}
                        className="relative flex h-screen w-screen items-center overflow-hidden bg-black"
                        style={{ width: `calc[100vw - ${width}` }} />
                ))}
            </motion.div>
        </>
    )
}