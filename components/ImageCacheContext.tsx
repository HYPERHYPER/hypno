import { createContext, useContext, useState, FC } from 'react';

interface ImageCacheContextValue {
    loadImageUrl: (url: string) => Promise<HTMLImageElement>;
    imageCache: Map<string, HTMLImageElement>;
}

const ImageCacheContext = createContext<ImageCacheContextValue | undefined>(undefined);

export const ImageCacheProvider = ({ children } : any) => {
    const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());

    const loadImageUrl = async (url: string): Promise<HTMLImageElement> => {
        if (imageCache.has(url)) {
            return imageCache.get(url)!;
        }

        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                setImageCache((prevCache) => new Map(prevCache).set(url, image));
                resolve(image);
            };
            image.onerror = (error) => reject(error);
            image.src = url;
        });
    };

    const contextValue: ImageCacheContextValue = {
        loadImageUrl,
        imageCache
    };

    return (
        <ImageCacheContext.Provider value={contextValue}>
            {children}
        </ImageCacheContext.Provider>
    );
};

export const useImageCache = (): ImageCacheContextValue => {
    const context = useContext(ImageCacheContext);
    if (!context) {
        throw new Error('useImageCache must be used within an ImageCacheProvider');
    }
    return context;
};
