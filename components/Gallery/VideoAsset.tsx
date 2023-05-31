import { CSSProperties, useCallback, useRef, useState } from "react";
import SpeakerOff from '../../public/pop/speaker-off.svg'

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
        <div className='block relative' style={style}>
            {muted && (
                <div className="absolute top-[10px] left-[10px] z-10">
                    <button onClick={unmuteVideo} className="cursor-pointer w-[35px] h-[35px] sm:w-[50px] sm:h-[50px] btn-circle bg-black flex items-center justify-center"><SpeakerOff /></button>
                </div>
            )}
            <video ref={vidRef} style={style} className='w-full h-auto' src={src} autoPlay loop playsInline muted poster={poster} />
        </div>
    )
}