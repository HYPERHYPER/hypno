import { DotsSpinner } from '../Spinner';
import clsx from 'clsx';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import EditTextPrompt from './EditTextPrompt';
import { MagicImage } from '@/hooks/useMagic';
import GraphicOverlay from './GraphicOverlay';
import useElementSize from '@/hooks/useElementSize';
import { useBackgroundMode } from '../BackgroundModeContext';
import { useImageCache } from '../ImageCacheContext';

type WatermarkProps = {
    url?: string;
    blendmode?: string;
}

const ProgressBar = ({ status }: { status?: string }) => {
    return (
        <div className='flex flex-col gap-3 items-center'>
            <DotsSpinner />
            {/* <progress className="progress w-40 sm:w-64 h-1" value={value ? `${value}` : undefined} max="100"></progress> */}
            <span className='font-medium'>{status}</span>
        </div>
    )
}

export function ImageAsset({ src, error, watermark, status }: { src?: string, error?: boolean, watermark?: WatermarkProps, status?: string }) {
    const isGenerating = _.isEmpty(src);

    const [loadImage, setLoadImage] = useState<boolean>(false);
    useEffect(() => {
        if (!isGenerating) {
            setLoadImage(true);
        }
    }, [isGenerating])

    const { width, height } = useElementSize('detail-view-image')

    return (
        <div
            className={clsx('relative bg-black/50 backdrop-blur-[50px] mx-auto transition-all')}
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            {(isGenerating || error) && (
                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                    {error ?
                        <h2 className='text-white text-4xl tracking-wider'>{':('}</h2>
                        : <ProgressBar status={status} />
                    }
                </div>
            )}

            <div className='block'>
                {!isGenerating && (
                    watermark ? (
                        <div className=''>
                            <GraphicOverlay
                                imageUrl={src}
                                watermark={watermark}
                                loadImage={!isGenerating}
                            />
                        </div>
                    ) : (
                        <img
                            src={src}
                            alt={`ai-${src}`}
                            className={clsx('w-auto m-auto transition duration-300', loadImage ? 'opacity-100' : 'opacity-0')}
                            style={{ width: `${width}px`, height: `${height}px` }}
                        />
                    )
                )}
            </div>
        </div>
    )
}

export const ImageCarousel = ({ urls, watermark }: { urls?: string[], watermark?: WatermarkProps }) => {
    const { loadImageUrl, imageCache } = useImageCache();
    const constructSrc = (url: string) => watermark?.url ? `/api/proxy-images?url=${url}` : url;

    useEffect(() => {
        if (urls) {
            const loadUrls = _.isEmpty(watermark?.url) ? urls : [...urls, watermark!.url]
            // Preload images before setting loadImage to true
            Promise.all(loadUrls?.map(url => {
                const urlToLoad = constructSrc(url || '') || '';
                return (
                    loadImageUrl(urlToLoad)
                )
            }))
        }
    }, [urls]);

    return (
        <div className='space-y-7'>
            {_.map(urls, (src, i) => (
                <ImageAsset
                    key={i}
                    src={imageCache.get(constructSrc(src)) ? src : ''}
                    watermark={watermark}
                />
            ))}
        </div>
    )
}

export default function MagicImageItem({ image, watermark, updateEditorPrompt, enablePromptEditor }: {
    image: MagicImage,
    watermark?: WatermarkProps,
    updateEditorPrompt?: any,
    enablePromptEditor?: boolean,
}) {
    const { mode: bgMode } = useBackgroundMode();
    const { src, status, textPrompt } = image;

    const handleEditTextPromptClick = () => {
        updateEditorPrompt(textPrompt);
    }

    const hasMultipleImages = _.size(image.urls) > 1;

    return (
        <div className='mb-7'>
            <div className='flex justify-center'>
                {(status == 'completed' || status == 'succeeded') && hasMultipleImages ? (
                    <ImageCarousel urls={image.urls} watermark={watermark} />
                ) : (
                    <ImageAsset src={src} error={status == 'failed'} watermark={watermark} status={status} />
                )}
            </div>
            {(status != 'pending' && enablePromptEditor) && (
                <div className="text-center mt-5 px-2">
                    <h3 className={clsx(bgMode == 'dark' ? "text-white/50" : "text-black/50", "mb-4")}>{textPrompt}</h3>
                    <EditTextPrompt onClick={handleEditTextPromptClick} />
                </div>
            )}
        </div>
    )
}