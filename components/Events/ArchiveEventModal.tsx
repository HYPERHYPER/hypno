import axios from "axios";
import Modal from "../Modal";
import useUserStore from "@/store/userStore";
import { useState } from "react";
import { SaveStatus } from "../Form/AutosaveStatusText";
import _ from 'lodash';
import clsx from "clsx";
import { useRouter } from "next/router";

interface Props {
    modalId: string;
    eventId: string;
}

export default function ArchiveEventModal({ modalId, eventId }: Props) {
    const { access_token } = useUserStore.useToken();
    const router = useRouter();
    const [status, setStatus] = useState<SaveStatus>('ready');

    const handleArchiveEvent = async (e: any) => {
        e.preventDefault();

        setStatus('saving');
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventId}/archive`;
        const token = access_token;

        await axios.delete(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        }).then((res) => {
            if (res.status === 200) {
                setStatus('success');
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            }
        }).catch((e) => {
            console.log(e);
            setStatus('error');
        });
    }


    return (
        <Modal
            id={modalId}
            title={'archive event?'}
            menu={<h2 className="text-white/50">you and other event members will no longer be able to edit or view this event</h2>}
            actionBtn={{
                hidden: true,
            }}
        >
            {status == 'saving' || status == 'success' ? (
                <button className='btn btn-lg btn-disabled rounded-3xl w-full'>
                    {status == 'saving' ? <span className="loading loading-dots loading-lg" /> : 'archive success!'}
                </button>
            ) : (
                <div className='flex flex-row justify-between gap-2'>
                    <label htmlFor={modalId} className='btn btn-lg btn-neutral rounded-3xl flex-1 cursor-pointer'>cancel</label>
                    <button className='btn btn-lg btn-error rounded-3xl flex-1 cursor-pointer' onClick={handleArchiveEvent}>confirm</button>
                </div>
            )}

        </Modal>
    )
}