import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import Scramble from "react-scramble";
import Close from '../../assets/icons/close.svg';
import { useBackgroundMode } from "../BackgroundModeContext";

// Each photo asset should have an edit text prompt button
export default function EditTextPrompt({ onClick }: { onClick: any }) {
    const { mode : bgMode } = useBackgroundMode();
    const handleOpenEditor = () => {
        // update text to edit based on prompt of image selected
        onClick && onClick();
        // open text editor
        window.text_prompt_editor_modal.showModal();
    }

    return (
        <button 
            onClick={() => handleOpenEditor()} 
            className={clsx(
                "cursor-pointer py-[10px] px-[15px] rounded-[30px] leading-none text-sm",
                bgMode == 'dark' ? 'bg-white/20 text-white/50' : 'bg-black text-white/80'
            )}>
                edit
                </button>
    )
}

// Only 1 modal should exist on page and will be updated with prompt
export function TextPromptEditor({ onChange, textPrompt, generateImage, isGenerating }: { onChange: any, textPrompt: string, generateImage: any, isGenerating: boolean }) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${(textareaRef.current.scrollHeight) * 1.2}px`;
        }
    };

    const confirmNewTextPrompt = useCallback(() => {
        generateImage && generateImage();
        window.text_prompt_editor_modal.close()
    }, [generateImage])

    const [loadedGlitch, setLoadedGlitch] = useState<boolean>(false);
    const [glitchState, setGlitchState] = useState<any>();
    const loadingTexts = ['one at a time pls', 'hold ur horses', 'ur already in line', 'magic takes a min',];
    const [textIdx, setTextIdx] = useState<number>(0);
    const [loadingText, setLoadingText] = useState<string>(loadingTexts[0]);
    useEffect(() => {
        if (loadedGlitch && glitchState?.restart) {
            const glitchText = () => {
                setTextIdx((prevTextIdx) => {
                    const newIdx = (prevTextIdx + 1) % loadingTexts.length;
                    setLoadingText(loadingTexts[newIdx]);
                    return newIdx;
                });
                glitchState.restart();
            }

            const intervalId = setInterval(glitchText, 6000);

            return () => { clearInterval(intervalId) }
        }
    }, [loadedGlitch])

    useEffect(() => {
        if (loadedGlitch && isGenerating && glitchState.start) {
            glitchState.start();

            const glitchText = () => {
                setTextIdx((prevTextIdx) => {
                    const newIdx = (prevTextIdx + 1) % loadingTexts.length;
                    setLoadingText(loadingTexts[newIdx]);
                    return newIdx;
                });
                glitchState.restart();
            }

            const intervalId = setInterval(glitchText, 6000);

            return () => { clearInterval(intervalId) }
        }
    }, [loadedGlitch, textPrompt, isGenerating]);

    useEffect(() => {
        if ("virtualKeyboard" in navigator) {
            const virtualKeyboard = navigator.virtualKeyboard as { overlaysContent?: boolean };
            if (virtualKeyboard.overlaysContent !== undefined) {
                virtualKeyboard.overlaysContent = true;
            }
        }
    }, []);

    return (
        <dialog
            id="text_prompt_editor_modal"
            className="modal bg-[#333333]/50 backdrop-blur-[20px] cursor-pointer mt-0"
            style={{ maxHeight: 'calc(100% - env(keyboard-inset-height))' }}
        >
            <div className="w-full p-7">
                <textarea
                    ref={textareaRef}
                    className="textarea focus:outline-none focus:bg-transparent textarea-lg text-xl bg-transparent text-center leading-[1.2] p-0 resize-none overflow-y-hidden w-full font-normal tracking-tight"
                    value={textPrompt}
                    onChange={(e) => onChange(e.target.value)}
                    onInput={adjustTextareaHeight}
                    rows={4}
                    placeholder="your magic text prompt"
                    tabIndex={1}
                />
            </div>
            <button
                onClick={() => window.text_prompt_editor_modal.close()}
                className="absolute top-0 right-0 p-6 cursor-pointer"
                autoFocus={false}
                tabIndex={-1}
            >
                <Close />
            </button>
            <button
                onClick={() => confirmNewTextPrompt()}
                className={clsx("absolute bottom-0 left-0 right-0 btn btn-gallery text-black bg-white border-white disabled:text-black disabled:bg-white", isGenerating ? 'cursor-disabled' : '')}
                disabled={isGenerating}
            >
                <Scramble
                    autoStart
                    text={isGenerating ? loadingText : 'ok'}
                    steps={isGenerating ? [
                        {
                            roll: 8,
                            action: '+',
                            type: 'all',
                        },
                        {
                            action: '-',
                            type: 'all',
                            text: loadingText
                        },
                    ] : []}
                    speed='fast'
                    bindMethod={c => {
                        setGlitchState({
                            restart: c.restart,
                            start: c.start,
                        })
                        setLoadedGlitch(true);
                    }}
                />
            </button>
        </dialog>
    )
}