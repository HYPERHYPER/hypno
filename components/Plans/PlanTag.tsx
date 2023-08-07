import useUserStore from "@/store/userStore"

export default function PlanTag({plan}:{plan: 'creator' | 'brand' }) {
    // const user = useUserStore.useUser();
    // check user plan and return null or tag
    return (
        <div 
            onClick={() => window.payment_plans_modal.showModal()}
            className='border-inherit border-[1px] p-1 sm:p-2 rounded text-xs sm:text-sm text-inherit cursor-pointer'>
                {plan}
            </div>
    )
}