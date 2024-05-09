import { useState, useEffect } from 'react';

/**
 * The `useElementSize` function in TypeScript uses the ResizeObserver API to track and return the
 * width and height of a specified element.
 * @param {string} elementId - The `elementId` parameter is a string that represents the id of the HTML
 * element for which you want to track the size changes.
 * @returns The `useElementSize` custom hook returns an object containing the width and height of the
 * element with the specified `elementId`. The object has the following structure: `{ width: number,
 * height: number }`.
 */
const useElementSize = (elementId: string) => {
    const [size, setSize] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const element = document.getElementById(elementId);
        if (!element) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setSize({ width, height });
            }
        });

        resizeObserver.observe(element);

        return () => {
            resizeObserver.unobserve(element);
        };
    }, [elementId]);

    return size;
};

export default useElementSize;