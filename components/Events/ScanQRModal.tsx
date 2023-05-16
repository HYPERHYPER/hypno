import Modal from "../Modal";
import Chain from 'public/pop/chain.svg'

interface Props {
    modalId: string;
    eventId: string;
    eventName: string;
}

export default function ScanQRModal({modalId, eventId, eventName}: Props) {
    return (
        <Modal 
            id={modalId} 
            title={'event code'}
            menu={<h2 className="text-white/50">scan to join this event and add photos via hypno iphone app</h2>}
            >
            <div className='flex flex-col items-center gap-4 my-4'>
                <div className='avatar placeholder'>
                    <div className="rounded-xl bg-white text-white w-[250px]">
                        <img src={`https://pro.hypno.com/api/v1/events/${eventId}/short_qr_code.png`} alt='QR Code' />
                    </div>
                </div>

                {/* <h2 className='text-primary flex gap-1 items-center'><Chain /> copy link to share</h2> */}
            </div>
        </Modal>
    )
}