import clsx from "clsx";
import { ReactNode } from "react";

export default function FormControl({label, altLabel, children, dir = 'row'}: {label?: string; altLabel?: string; children: ReactNode, dir?: 'row' | 'col' }) {
    return (
        <div className={clsx(dir == 'col' ? 'flex-col' : 'flex-row justify-between items-center', "w-full flex flex-wrap gap-4 py-2 sm:py-7 border-b-2 border-white/20 first:border-b-2 first:border-white/20 min-h-[60px] sm:min-h-[100px]")}>
            <label className="text-white/40 flex flex-row flex-wrap gap-2 items-baseline">
                <span className="text-xl sm:text-4xl">{label}</span>
                {altLabel && <span className="sm:text-xl">{altLabel}</span>}
            </label>
            <div className={clsx("flex flex-1", dir == 'col' ? 'flex-col items-start gap-2' : 'items-center justify-end')}>{children}</div>
        </div>
    )
}