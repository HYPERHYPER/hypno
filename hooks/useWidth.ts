import { useEffect, useState } from "react";

export default function useWidth() {
  const hasWindow = typeof window !== "undefined";

  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const safeAreaInsetRight = (hasWindow && window.safeAreaInsets) ? window.safeAreaInsets.right : 0;
      setWidth(vw - safeAreaInsetRight);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return width; 
}
