import { useCallback, useRef } from "react";

// Each photo asset should have an edit text prompt button
export default function EditTextPrompt({ onClick }: { onClick: any }) {
    const handleOpenEditor = () => {
        // update text to edit based on prompt of image selected
        onClick && onClick();
        // open text editor
        window.text_prompt_editor_modal.showModal();
    }

    return (
        <button onClick={() => handleOpenEditor()} className="cursor-pointer py-[10px] px-[15px] rounded-[30px] leading-none bg-white/20 text-sm text-white/50">edit</button>
    )
}

// Only 1 modal should exist on page and will be updated with prompt
export function TextPromptEditor({ onChange, textPrompt, generateImage }: { onChange: any, textPrompt: string, generateImage: any }) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const confirmNewTextPrompt = useCallback(() => {
        generateImage && generateImage();
        window.text_prompt_editor_modal.close()
    }, [generateImage])

    return (
        <dialog id="text_prompt_editor_modal" className="modal bg-[#333333]/50 backdrop-blur-[20px] cursor-pointer mt-0">
            <button
                onClick={() => window.text_prompt_editor_modal.close()}
                className="absolute top-0 right-0 p-6 cursor-pointer"
                autoFocus={false}
                tabIndex={-1}
            >
                <div className="bg-white w-[30px] sm:w-[60px] h-1 rounded-sm" />
            </button>
            <div className="w-full p-7">
                <textarea
                    ref={textareaRef}
                    className="textarea focus:outline-none focus:bg-transparent textarea-lg text-xl bg-transparent text-center leading-[1.2] p-0 resize-none overflow-y-hidden w-full min-h-[40px] font-normal tracking-tight"
                    value={textPrompt}
                    onChange={(e) => onChange(e.target.value)}
                    onInput={adjustTextareaHeight}
                    rows={1}
                    placeholder="your magic text prompt"
                />
            </div>
            <button
                onClick={() => confirmNewTextPrompt()}
                className="absolute bottom-0 left-0 right-0 btn btn-gallery text-black bg-white border-white">
                ok
            </button>
        </dialog>
    )
}