import clsx from "clsx";
import { ReactNode } from "react";
import Nested from 'assets/icons/nested.svg'
import PlanTag from "../Plans/PlanTag";

export default function FormControl({ label, altLabel, children, dir = 'row', nested, disabled, featureGated }: { label?: string; altLabel?: string; children: ReactNode, dir?: 'row' | 'col', nested?: boolean, disabled?: boolean, featureGated?: 'creator' | 'brand' }) {
    return (
        <div className={clsx(dir == 'col' ? 'flex-col' : 'flex-row justify-between items-center', "w-full flex flex-wrap gap-4 py-2 sm:py-7 border-b-2 border-white/20 first:border-b-2 first:border-white/20 min-h-[60px] sm:min-h-[100px]")}>
            <label className={clsx("flex flex-row flex-wrap gap-2 items-center transition-colors", disabled ? 'text-white/20 border-white/20' : 'text-white/40 border-white/40')}>
                <span className="text-xl sm:text-4xl flex items-center">{nested && <Nested />}{label}</span>
                {altLabel && <span className="sm:text-xl">{altLabel}</span>}
                {featureGated && <PlanTag plan={featureGated} />}
            </label>
            <div className={clsx("flex flex-1", dir == 'col' ? 'flex-col items-start gap-2' : 'items-center justify-end')}>
                {featureGated ?
                    <span className="text-primary text-xl sm:text-4xl cursor-pointer" onClick={() => window.payment_plans_modal.showModal()}>upgrade</span>
                    : children
                }
            </div>
        </div>
    )
}