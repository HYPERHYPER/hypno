import { ReactNode } from "react";
import { SaveStatus } from "./Form/AutosaveStatusText";
import clsx from "clsx";

interface TriggerModalProps {
  id?: string;
  children?: ReactNode;
  onClick?: () => void;
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
        onClick?: (e: any) => void;
        hidden?: boolean;
    };
    wide?: boolean;
}

const TriggerModal = ({ id, children, onClick }: TriggerModalProps) => {
  return (
    <label htmlFor={id} className="cursor-pointer" onClick={onClick}>
      {children}
    </label>
  );
};

const btnClassName =
  "tracking-tight btn btn-primary rounded-[20px] btn-block h-[60px] text-2xl cursor-pointer";

export default function Modal({ title, id, children, onDone, menu, actionBtn, wide }: ModalProps) {
    return (
        <>
            <input type="checkbox" id={id} className="modal-toggle" />
            <label htmlFor={id} className="modal bg-[#333333]/50 backdrop-blur-[20px] cursor-pointer">
                <label htmlFor="" className={clsx("modal-box max-w-3xl px-[20px] py-[30px] sm:px-[40px] sm:py-[35px] relative bg-black rounded-[20px] sm:rounded-[40px] tracking-tight overflow-clip", 
                    wide ? 'lg:max-w-7xl' : ''
                )}>
                    <div className="flex justify-between">
                        <div className="flex flex-col items-baseline gap-3">
                            <h1 className="text-white sm:text-5xl">{title}</h1>
                            <div className="flex flex-row gap-x-4">
                                {/* <h2 className="text-primary"><label htmlFor={id} className="cursor-pointer">cancel</label></h2> */}
                                {menu}
                            </div>
                        </div>
                        <label htmlFor={id} className="h-[30px] sm:h-[40px] w-[30px] sm:w-[60px] flex items-center  cursor-pointer">
                            <div className="bg-white/40 w-[30px] sm:w-[60px] h-1 rounded-sm" />
                        </label>
                    </div>

                    <div className={clsx(
                        `pr-2 mt-5 sm:mt-10 mb-9 overflow-y-scroll`, 
                        actionBtn && actionBtn.hidden ? 'mb-0' : 'mb-9',
                        wide ? 'max-h-[75vh]' : 'max-h-[50vh]'
                        )}>
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
  );
}

Modal.Trigger = TriggerModal;
