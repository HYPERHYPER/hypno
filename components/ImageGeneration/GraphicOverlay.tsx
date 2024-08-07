import { convertBlendMode } from '@/helpers/blendmode';
import useElementSize from '@/hooks/useElementSize';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { AssetLoader } from './ImageAsset';

interface GraphicOverlayProps {
    imageUrl?: string;
    watermark?: {
        url?: string;
        blendmode?: string;
    };
}

const GraphicOverlay = ({ imageUrl, watermark }: GraphicOverlayProps) => {
    const { width, height } = useElementSize('detail-view-image');
    const blendMode = convertBlendMode(watermark?.blendmode || 'over');
    const watermarkUrl = watermark?.url || '';

    const [combinedImage, setCombinedImage] = useState<string | null>(null);
    const [loadImage, setLoadImage] = useState<boolean>(false);

    useEffect(() => {
        const fetchCombinedImage = async () => {
            if (!imageUrl || !watermarkUrl) return;

            const apiUrl = `/api/combine-images?imageUrl=${encodeURIComponent(String(imageUrl))}&watermarkUrl=${encodeURIComponent(watermarkUrl)}&blendMode=${blendMode}`;
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch combined image');
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                setCombinedImage(objectUrl);
            } catch (error) {
                console.error('Error fetching combined image:', error);
            }
        };

        if (!combinedImage && !loadImage) {
            fetchCombinedImage();
        }

        // Cleanup function to revoke the object URL
        return () => {
            if (combinedImage) {
                URL.revokeObjectURL(combinedImage);
            }
        };
    }, [imageUrl]);

    useEffect(() => {
        if (combinedImage) {
            setTimeout(() => {
                setLoadImage(true);
            }, 50);
        }
    }, [combinedImage]);

    if (!combinedImage) return <AssetLoader width={width} height={height} isGenerating={true} />;
    return (
        <img
            src={String(combinedImage)}
            id={`ai-${imageUrl}`}
            style={{ width: `${width}px`, height: `${height}px` }}
            className={clsx('transition duration-300', loadImage ? 'opacity-100' : 'opacity-0')}
        />
    );
};

export default GraphicOverlay;
