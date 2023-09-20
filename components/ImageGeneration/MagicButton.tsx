import clsx from "clsx";
import { useEffect, useState } from "react";
import Scramble from 'react-scramble';

interface MagicButtonProps {
    isLoading?: boolean;
    mobile?: boolean;
    onClick?: any;
}

export default function MagicButton({ isLoading, mobile, onClick }: MagicButtonProps) {
    const [loadedGlitch, setLoadedGlitch] = useState<boolean>(false);
    const [state, setState] = useState<any>();

    const loadingTexts = ['one m☻ment', 'dont go anywhere', 'just a sec', 'cooking...', 'b right there', 'pls hold'];
    const [textIdx, setTextIdx] = useState<number>(0);
    const [loadingText, setLoadingText] = useState<string>(loadingTexts[0]);

    useEffect(() => {
            if (loadedGlitch && state?.restart) {
                const glitchText = () => {
                    setTextIdx((prevTextIdx) => {
                        const newIdx = (prevTextIdx + 1) % loadingTexts.length;
                        setLoadingText(loadingTexts[newIdx]);
                        return newIdx;
                      });
                    state.restart();
                }

                const intervalId = setInterval(glitchText, isLoading ? 6000 : 4000);
    
                return () => { clearInterval(intervalId) }
            }
    }, [loadedGlitch])

    return (
        <>
            <button
                className={clsx('btn btn-info btn-gallery locked overflow-hidden relative disabled:text-black disabled:bg-white', isLoading ? 'cursor-disabled' : '')}
                onClick={onClick}
                disabled={isLoading}
            >
                <Scramble
                    autoStart
                    text={isLoading ?
                        loadingText
                        : 'tap for magic'
                    }
                    steps={[
                        {
                            roll: 8,
                            action: '+',
                            type: 'all',
                        },
                        {
                            action: '-',
                            type: isLoading ? 'all' : 'forward',
                            text: isLoading ? loadingText : 'tap for magic'
                        },
                    ]}
                    speed='fast'
                    bindMethod={c => {
                        setState({
                            start: c.start,
                            pause: c.pause,
                            restart: c.restart,
                        })
                        setLoadedGlitch(true);
                    }}
                />
            </button>
        </>
    )
}