import Letter from '../../public/pop/letter.svg';

export default function SingleAssetDeliveryConfirmation() {
    return (
        <div className='fixed hero top-0 left-0 h-screen p-10'>
            <div className='hero-content max-w-[24rem] sm:max-w-2xl flex flex-col bg-white/10 backdrop-blur-lg gap-4 items-center justify-center p-8'>
                <span className='flex-1'><Letter /></span>
                <h2 className='text-white text-center'>Thank you! <br /> Your content will be delivered to your email shortly.</h2>
            </div>
        </div>
    )
}