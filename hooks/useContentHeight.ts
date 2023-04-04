import { useEffect, useState } from "react";

export default function useContentHeight({footer}:{footer?: boolean}) {
  const hasWindow = typeof window !== "undefined";

  const [height, setHeight] = useState<number | null>(0);

  useEffect(() => {
    const updateHeight = () => {
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const safeAreaInsetBottom = (hasWindow && window.safeAreaInsets) ? window.safeAreaInsets.bottom : 0;
      const spacer = vw > 635 ? 0.33*vh : 2*(vw * 0.22);
      setHeight(vh - spacer - safeAreaInsetBottom);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return height ? height + "px" : "100vh";
}
