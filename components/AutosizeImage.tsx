import { useState } from "react";
import Image from "next/image";

/**
 * Image component fills container width and maintains aspect ratio height to display full image
 */
export default function AutosizeImage({
    src,
    alt = "",
    onLoadingComplete,
}: {
    src?: any;
    alt?: string;
    onLoadingComplete?: () => void;
}) {
    const [paddingTop, setPaddingTop] = useState<string>("0");

    return (
        <div className="relative min-h-[100px]" style={{ paddingTop }}>
            <Image
                src={src}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw,
                        (max-width: 1200px) 50vw,
                        33vw"
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