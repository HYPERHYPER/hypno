import { CSSProperties, useCallback, useRef, useState } from "react";
import Sound from '../../assets/icons/sound.svg'

export default function VideoAsset({ src, poster, style }: { src?: string; poster?: string, style?: CSSProperties}) {
    const vidRef = useRef<HTMLVideoElement>(null);
    const [muted, setMuted] = useState<boolean>(true);
    
    const unmuteVideo = useCallback(() => {
        if (vidRef.current) {
            vidRef.current.muted = false;
            setMuted(false);
        }
    }, [vidRef]);
    
    return (
        <div className='relative' style={style}>
            {muted && (
                <div className="absolute top-[10px] left-[10px] z-10">
                    <button onClick={unmuteVideo} className="cursor-pointer flex items-center justify-center"><span className="scale-50 -translate-x-1/4 -translate-y-1/4"><Sound /></span></button>
                </div>
            )}
            <video ref={vidRef} style={style} className='w-full h-auto' src={src} autoPlay loop playsInline muted poster={poster} />
        </div>
    )
}