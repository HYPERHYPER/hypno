import { convertBlendMode } from '@/helpers/blendmode';
import useElementSize from '@/hooks/useElementSize';
import clsx from 'clsx';
import React, { useRef, useEffect, useState } from 'react';
import { useImageCache } from '../ImageCacheContext';

interface GraphicOverlayProps {
    imageUrl?: string;
    watermark?: {
        url?: string;
        blendmode?: string;
    };
    loadImage: boolean;
}

const GraphicOverlay = ({ imageUrl, watermark, loadImage }: GraphicOverlayProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { width, height } = useElementSize('detail-view-image');
    const blendMode = convertBlendMode(watermark?.blendmode || 'source-over')
    const watermarkUrl = watermark?.url || '';
    const { loadImageUrl } = useImageCache();
    const [ displayImage, setDisplayImage ] = useState<boolean>(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const drawImageWithWatermark = async () => {
            if (!imageUrl || !watermarkUrl) return;
            console.log('drawImageWithWatermark')
            try {
                const [image, watermark] = await Promise.all([
                    loadImageUrl(`/api/proxy-images?url=${imageUrl}`),
                    loadImageUrl(`/api/proxy-images?url=${watermarkUrl}`),
                ]);

                // Calculate scaling factors for the image and watermark
                const imageScaleFactor = Math.min(width / image.width, height / image.height);
                const watermarkScaleFactor = Math.min(width / watermark.width, height / watermark.height);

                // Set canvas dimensions to match element size
                // Increase canvas size for higher resolution
                const canvasWidth = width * window.devicePixelRatio;
                const canvasHeight = height * window.devicePixelRatio;
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                // Scale canvas context to match device pixel ratio
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
                context.scale(window.devicePixelRatio, window.devicePixelRatio);

                // Set image smoothing for better quality
                context.imageSmoothingEnabled = true;

                // Clear the canvas
                context.clearRect(0, 0, canvasWidth, canvasHeight);

                // Draw the image
                const scaledImageWidth = image.width * imageScaleFactor;
                const scaledImageHeight = image.height * imageScaleFactor;
                context.drawImage(image, 0, 0, scaledImageWidth, scaledImageHeight);

                // Set blend mode
                context.globalCompositeOperation = blendMode as GlobalCompositeOperation; // Change blend mode as needed

                // Scale watermark to match image dimensions
                const scaledWatermarkWidth = watermark.width * watermarkScaleFactor;
                const scaledWatermarkHeight = watermark.height * watermarkScaleFactor;

                // Draw the scaled watermark on top of the image
                context.drawImage(watermark, 0, 0, scaledWatermarkWidth, scaledWatermarkHeight);

                setDisplayImage(true);
            } catch (error) {
                console.error('Error loading images:', error);
            }
        };

        drawImageWithWatermark();

        // Add touch event listener for saving the image
        const saveImageOnTouch = async (event: any) => {
            event.stopPropagation(); // Stop the touch event from propagating

            const canvas = canvasRef.current;
            if (canvas) {
                const dataURL = canvas.toDataURL('image/png');

                // Convert data URL to Blob
                const blob = await fetch(dataURL).then(response => response.blob());

                // Convert Blob to File
                const file = new File([blob], 'hypno-ai.png', { type: 'image/png' });

                try {
                    await navigator.share({ files: [file] });
                } catch (error) {
                    console.error('Error sharing image:', error);
                }
            }
        };

        canvas.addEventListener('touchend', saveImageOnTouch);

        return () => {
            canvas.removeEventListener('touchend', saveImageOnTouch);
        };
    }, [imageUrl, watermarkUrl, width, height, canvasRef.current, loadImage]);

    return (
        <canvas
            id={`ai-${imageUrl}`}
            style={{ width: `${width}px`, height: `${height}px` }}
            className={clsx('transition duration-300', displayImage ? 'opacity-100' : 'opacity-0')}
            ref={canvasRef}
        />
    );
};

export default GraphicOverlay;


