import { DotsSpinner } from '../Spinner';
import clsx from 'clsx';
import _ from 'lodash';
import { useEffect, useState } from 'react';

export default function ImageAsset({ src }: { src?: string }) {
    const isGenerating = _.isEmpty(src);

    const [loadImage, setLoadImage] = useState<boolean>(false);
    useEffect(() => {
        if (!isGenerating) {
            setLoadImage(true);
        }
    }, [isGenerating])

    return (
        <div
            className={clsx('relative mt-4 bg-black/50 backdrop-blur-[50px] mx-auto', isGenerating ? 'w-auto aspect-square min-w-full' : 'w-auto')}>
            {isGenerating && (
                <div className='absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <DotsSpinner />
                </div>
            )}

            <div className='block'>
                {!isGenerating && (
                    <img 
                        src={src} 
                        alt={`ai-${src}`} 
                        className={clsx('w-auto transition duration-300', loadImage ? 'opacity-100' : 'opacity-0')}
                        />
                )}
            </div>
        </div>
    )
}