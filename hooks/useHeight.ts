import { useEffect, useState } from "react";

export default function useHeight() {
  const hasWindow = typeof window !== "undefined";

  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      const safeAreaInsetBottom = (hasWindow && window.safeAreaInsets) ? window.safeAreaInsets.bottom : 0;
      setHeight(vh - safeAreaInsetBottom);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return height ? height + "px" : "100vh"; 
}
