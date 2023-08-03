import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

/**
 * Image component fills container width and maintains aspect ratio height to display full image
 */
export default function AutosizeImage({
    src,
    alt = "",
    onLoadingComplete,
    width,
    height,
    ...rest
}: {
    src?: any;
    alt?: string;
    onLoadingComplete?: () => void;
    width?: number;
    height?: number;
    priority?: boolean;
    sizes?: string;
}) {
    const [paddingTop, setPaddingTop] = useState<string>("0");
    // const [blurDataURL, setBlurDataURL] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    // useEffect(() => {
    //     const getBlurDataUrl = async () => {
    //         const res = await fetch(`/api/image?url=${src}`);
    //         const placeholderData = await res.json();
    //         setBlurDataURL(placeholderData.base64);
    //     }

    //     if (!src) return;
    //     getBlurDataUrl();
    // }, [])


    return (
        <div className={clsx('relative border-0 transition-opacity duration-300 min-h-[1px]', isLoaded ? 'opacity-100' : 'opacity-0')} style={{ paddingTop }}>
            <Image
                src={src}
                fill
                style={{ objectFit: 'cover' }}
                alt={alt}
                onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                    setPaddingTop(`calc(100% / (${naturalWidth} / ${naturalHeight})`);
                    setIsLoaded(true);
                    onLoadingComplete && onLoadingComplete();
                }}
                // placeholder={blurDataURL ? 'blur' : 'empty'}
                // blurDataURL={blurDataURL || undefined}
                priority={true}
                {...rest}
            />
        </div>
    )
}
