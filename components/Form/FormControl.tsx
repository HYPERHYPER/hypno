import { ReactNode } from "react";

export default function FormControl({label, altLabel, children}: {label?: string; altLabel?: string; children: ReactNode}) {
    return (
        <div className="w-full flex flex-row justify-between items-center flex-wrap gap-4 py-2 sm:py-7 border-b-2 border-white/20 first:border-b-2 first:border-white/20 min-h-[60px] sm:min-h-[100px]">
            <label className="text-white/40 flex flex-row flex-wrap gap-2 items-baseline">
                <span className="text-xl sm:text-4xl">{label}</span>
                {altLabel && <span className="sm:text-xl">{altLabel}</span>}
            </label>
            <div className="flex items-center justify-end flex-1">{children}</div>
        </div>
    )
}