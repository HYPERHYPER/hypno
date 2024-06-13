import { isImageDark } from '@/helpers/image';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for the context value
type BackgroundModeContextType = {
    mode: 'dark' | 'light';
    toggleMode: () => void;
};

// Create the context
const BackgroundModeContext = createContext<BackgroundModeContextType | undefined>(undefined);

// Custom hook to consume the context
export const useBackgroundMode = () => {
    const context = useContext(BackgroundModeContext);
    if (!context) {
        throw new Error('useBackgroundMode must be used within a BackgroundModeProvider');
    }
    return context;
};

// Props for BackgroundModeProvider
type BackgroundModeProviderProps = {
    backgroundImage: string | null; // Change the type to string | null
    children: ReactNode;
};

// Provider component to set the context value
export const BackgroundModeProvider = ({ backgroundImage, children }: BackgroundModeProviderProps) => {
    // Determine mode based on the background image
    const determineMode = (): 'dark' | 'light' => {
        // Determine mode based on the background image
        // Dark mode for dark backgrounds
        return isDarkBackground(backgroundImage) ? 'dark' : 'light';
    };

    // Function to check if the background is dark
    const isDarkBackground = (image: string | null): boolean => {
        // Determine if the background is dark
        // Dark if the image is not provided
        if (image) {
            isImageDark(image)
            .then((result) => {
                // console.log('Image is', result);
                return result == 'dark';
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }

        return false;
    };

    // State to hold the mode
    const [mode, setMode] = useState<'dark' | 'light'>(determineMode());

    // Function to toggle mode
    const toggleMode = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return (
        <BackgroundModeContext.Provider value={{ mode, toggleMode }}>
            {children}
        </BackgroundModeContext.Provider>
    );
};