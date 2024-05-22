import { DotsSpinner } from '../Spinner';
import clsx from 'clsx';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import EditTextPrompt from './EditTextPrompt';
import { MagicImage } from '@/hooks/useMagic';
import Carousel from "nuka-carousel"
import ArrowNext from '../../assets/icons/arrow-next.svg';
import ArrowBack from '../../assets/icons/arrow-back.svg';
import GraphicOverlay from './GraphicOverlay';
import useElementSize from '@/hooks/useElementSize';

type WatermarkProps = {
    url?: string;
    blendmode?: string;
}

export function ImageAsset({ src, error, watermark }: { src?: string, error?: boolean, watermark?: WatermarkProps }) {
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
                        : <DotsSpinner />
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
    const [loadImage, setLoadImage] = useState<boolean>(false);
    const { width, height } = useElementSize('detail-view-image');

    useEffect(() => {
        // Preload images before setting loadImage to true
        Promise.all(urls?.map(url => new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = reject;
        })) || []).then(() => {
            setLoadImage(true);
        });
    }, [urls]);

    return (
        <div className='space-y-7'>
            {/* <Carousel
                className='bg-black/50 backdrop-blur-[50px]'
                wrapAround={true}
                swiping={false}
                defaultControlsConfig={{
                    nextButtonStyle: { padding: '8px', background: 'none' },
                    nextButtonText: <span className='carousel-arrow'><ArrowNext /></span>,
                    prevButtonStyle: { padding: '8px', background: 'none' },
                    prevButtonText: <span className='carousel-arrow'><ArrowBack /></span>,
                    pagingDotsStyle: { fill: 'white', scale: '125%', borderRadius: '100%' },
                    pagingDotsContainerClassName: 'space-x-3',
                }}
                style={{ width: `${width}px`, height: `${height}px` }}
            > */}
                {_.map(urls, (src, i) => {
                    if (watermark) {
                        return (
                            <div key={i}
                                className={clsx('bg-black/50 backdrop-blur-[50px]')}>
                                <GraphicOverlay
                                    imageUrl={src}
                                    watermark={watermark}
                                    loadImage={loadImage}
                                />
                            </div>
                        )
                    }
                    return <img
                        key={i}
                        src={src}
                        alt={`ai-${i}`}
                        className={clsx('h-auto w-full object-cover transition duration-300', loadImage ? 'opacity-100' : 'opacity-0')}
                        style={{ width: `${width}px`, height: `${height}px` }}
                    />
                })}
            {/* </Carousel> */}
        </div>
    )
}

export default function MagicImageItem({ image, watermark, updateEditorPrompt, disablePromptEditor }: {
    image: MagicImage,
    watermark?: WatermarkProps,
    updateEditorPrompt?: any,
    disablePromptEditor?: boolean,
}) {
    const { src, status, textPrompt } = image;
    const handleEditTextPromptClick = () => {
        updateEditorPrompt(textPrompt);
    }

    const hasMultipleImages = _.size(image.urls) > 1;

    return (
        <div className='mb-7'>
            <div className='flex justify-center'>
                {(status == 'completed' || status == 'succeeded') && hasMultipleImages ? (
                    <ImageCarousel urls={image?.urls} watermark={watermark} />
                ) : (
                    <ImageAsset src={src} error={status == 'failed'} watermark={watermark} />
                )}
            </div>
            {(status != 'pending' && !disablePromptEditor) && (
                <div className="text-center mt-5 px-2">
                    <h3 className="text-white/50 mb-4">{textPrompt}</h3>
                    <EditTextPrompt onClick={handleEditTextPromptClick} />
                </div>
            )}
        </div>
    )
}