import { useState } from "react";
import Image from "next/image";
import { getAspectRatio } from "@/helpers/image";

/**
 * Image component fills container width and maintains aspect ratio height to display full image
 */
export default function AutosizeImage({
    src,
    alt = "",
    onLoadingComplete,
    width,
    height,
}: {
    src?: any;
    alt?: string;
    onLoadingComplete?: () => void;
    width?: number;
    height?: number;
}) {
    const [paddingTop, setPaddingTop] = useState<string>("0");

    return (
        <div className='relative border-0' style={{ paddingTop }}>
            <Image
                src={src}
                fill
                style={{ objectFit: 'cover' }}
                quality={100}
                alt={alt}
                onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                    setPaddingTop(`calc(100% / (${naturalWidth} / ${naturalHeight})`);
                    onLoadingComplete && onLoadingComplete();
                }}
            />
        </div>
    )
}