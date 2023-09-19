import { useCallback, useRef } from "react";

export default function EditTextPrompt({ onChange, textPrompt, generateImage }: { onChange: any, textPrompt: string, generateImage: any }) {
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
        <>
            <button onClick={() => window.text_prompt_editor_modal.showModal()} className="cursor-pointer py-[10px] px-[15px] rounded-[30px] leading-none bg-white/20 text-sm text-white/50">edit</button>
            
            <dialog id="text_prompt_editor_modal" className="modal bg-[#333333]/50 backdrop-blur-[20px] cursor-pointer mt-0">
                <button
                    onClick={() => window.text_prompt_editor_modal.close()}
                    className="absolute top-0 right-0 p-6 cursor-pointer"
                >
                    <div className="bg-white w-[30px] sm:w-[60px] h-1 rounded-sm" />
                </button>
                <div className="w-full p-7">
                    <textarea
                        ref={textareaRef}
                        className="textarea focus:outline-none focus:bg-transparent textarea-lg text-xl bg-transparent text-center leading-none p-0 resize-none overflow-y-hidden w-full min-h-[40px] font-normal"
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
        </>
    )
}