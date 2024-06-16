import { useEffect, useState } from "react";

export default function useImageExistence(imageUrl: string) {
    const [imageExists, setImageExists] = useState<boolean>(false);
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const checkImageExistence = async () => {
            console.log('here', imageUrl)
            try {
                const response = await fetch(imageUrl);
                if (response.ok) {
                    console.log('IMAGE FOUND')
                    setImageExists(true); // Image exists
                    clearInterval(intervalId!); // Stop the interval
                } else {
                    console.log('IMAGE DNE')
                    setImageExists(false); // Image does not exist or there was an issue
                }
            } catch (error) {
                console.log('error', error)
                setImageExists(false); // Failed to connect to the URL
            }
        };

        if (imageUrl?.trim() !== '') {
            // Start checking image existence every 3 seconds
            intervalId = setInterval(checkImageExistence, 3000);
        }

        return () => {
            // Clean up the interval when the component unmounts or when URL changes
            if (intervalId) clearInterval(intervalId);
        };
    }, [imageUrl]);

    return { imageExists };
}
