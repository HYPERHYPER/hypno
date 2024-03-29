import { ReactNode } from "react";
import { SaveStatus } from "./Form/AutosaveStatusText";
import Spinner from "./Spinner";

interface TriggerModalProps {
    id?: string;
    children?: ReactNode;
}

interface ModalProps {
    id?: string;
    children?: ReactNode;
    title?: string;
    onDone?: () => void;
    menu?: ReactNode;
    actionBtn?: {
        status?: SaveStatus;
        text?: string;
        onClick?: () => void;
        hidden?: boolean;
    };
}

const TriggerModal = ({ id, children }: TriggerModalProps) => {
    return (
        <label htmlFor={id} className="cursor-pointer">{children}</label>
    )
}

const btnClassName = "tracking-tight btn btn-primary rounded-[20px] btn-block h-[60px] text-2xl cursor-pointer";

export default function Modal({ title, id, children, onDone, menu, actionBtn }: ModalProps) {
    return (
        <>
            <input type="checkbox" id={id} className="modal-toggle" />
            <label htmlFor={id} className="modal bg-[#333333]/50 backdrop-blur-[20px] cursor-pointer">
                <label htmlFor="" className="modal-box max-w-3xl px-[40px] py-[35px] relative bg-black rounded-[60px] tracking-tight overflow-clip">
                    <div className="flex justify-between">
                        <div className="space-y-4">
                            <h1 className="text-white">{title}</h1>
                            <div className="flex flex-row gap-4">
                                {/* <h2 className="text-primary"><label htmlFor={id} className="cursor-pointer">cancel</label></h2> */}
                                {menu}
                            </div>
                        </div>
                        <label htmlFor={id} className="h-[30px] sm:h-[60px] w-[30px] sm:w-[60px] flex items-center  cursor-pointer">
                            <div className="bg-white/40 w-[30px] sm:w-[60px] h-1 rounded-sm" />
                        </label>
                    </div>

                    <div className={`mt-5 sm:mt-10 mb-9 max-h-[50vh] overflow-y-scroll ${actionBtn && actionBtn.hidden ? 'mb-0' : 'mb-9'}`}>
                        {children}
                    </div>

                    {actionBtn ? (actionBtn.hidden ? null : (
                        <button onClick={actionBtn.onClick} className={btnClassName} disabled={actionBtn.status == 'success' || actionBtn.status == 'saving' }>
                            {(actionBtn.status == 'ready' || actionBtn.status == 'error') && actionBtn.text}
                            {actionBtn.status == 'saving' && <span className="loading loading-dots"></span>}
                            {actionBtn.status == 'success' && 'success!'}
                        </button>
                    )) : (
                        <label htmlFor={id} onClick={onDone ? onDone : undefined} className={btnClassName}>done</label>
                    )}
                </label>
            </label>
        </>
    )
}

Modal.Trigger = TriggerModal;