import clsx from "clsx";
import { ReactNode } from "react";
import Nested from 'assets/icons/nested.svg'
import PlanTag from "../Plans/PlanTag";
import Question from 'public/pop/question-filled.svg'

export default function FormControl({ label, altLabel, children, dir = 'row', nested, disabled, featureGated }: { label?: string; altLabel?: string; children: ReactNode, dir?: 'row' | 'col', nested?: boolean, disabled?: boolean, featureGated?: 'creator' | 'brand' }) {
    return (
        <div className={clsx(dir == 'col' ? 'flex-col' : 'flex-row justify-between items-center', "w-full flex flex-wrap gap-4 py-2 sm:py-3 border-b-2 border-white/20 first:border-b-2 first:border-white/20 min-h-[60px] sm:min-h-[60px]")}>
            <label className={clsx("flex flex-row flex-wrap gap-2 items-center transition-colors", disabled ? 'text-white/20 border-white/20' : 'text-white/40 border-white/40')}>
                <span className="text-xl sm:text-3xl flex items-center">
                    {nested && <Nested />}{label} {altLabel && <span className="ml-1 tooltip tooltip-primary max-w-[100px]" data-tip={altLabel}><Question /></span>}
                </span>
                {/* {featureGated && <PlanTag plan={featureGated} />} */}
            </label>
            <div className={clsx("flex flex-1", dir == 'col' ? 'flex-col items-start gap-2' : 'items-center justify-end')}>
                {featureGated ?
                    <span className="text-primary text-xl sm:text-3xl cursor-pointer" onClick={() => window.payment_plans_modal.showModal()}>upgrade</span>
                    : children
                }
            </div>
        </div>
    )
}