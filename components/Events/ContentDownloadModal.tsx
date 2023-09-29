import axios from "axios";
import Modal from "../Modal";
import useUserStore from "@/store/userStore";
import { useState } from "react";
import { saveAs } from 'file-saver';
import Duplicate from 'public/pop/duplicate.svg';
import Checkmark from 'public/pop/checkmark.svg';
import { SaveStatus } from "../Form/AutosaveStatusText";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import _ from 'lodash';
import clsx from "clsx";
import Spinner from "../Spinner";
import FormControl from "../Form/FormControl";

interface Props {
    modalId: string;
    eventId: string;
}

export default function ContentDownloadModal({ modalId, eventId }: Props) {
    const { access_token } = useUserStore.useToken();
    const { email } = useUserStore.useUser();

    const [status, setStatus] = useState<SaveStatus>('ready');
    const [contentType, setContentType] = useState<'all' | 'favorites'>('all');

    const handleEmailDownload = async () => {
        setStatus('saving');
        const sendType = contentType == 'favorites' ? 'send_favorites_zip' : 'send_content_zip'
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventId}/${sendType}?email_address=${email}`;
        const token = access_token;
        await axios.post(url, undefined, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        }).then(async (res) => {
            if (res.status === 200) {
                setStatus('success');
                setTimeout(() => {
                    setStatus('ready')
                }, 5000);
            }
        }).catch((e) => {
            console.log(e);
            setStatus('error');
        });
    }

    return (
        <Modal
            id={modalId}
            title={'content download'}
            menu={
                <h2 className="text-white/50">
                    {(status == 'ready' || status == 'saving') && `send event content to your email for download via zip file`}
                    {status == 'success' && 'check your email for zip file'}
                    {(status == 'error' && contentType == 'all') && 'there was an error sending your content - pls try again later'}
                    {(status == 'error' && contentType == 'favorites') && 'oops! no favorited content to send'}
                </h2>}
            actionBtn={{
                status,
                text: 'email',
                onClick: () => handleEmailDownload()
            }}
        >

            <div className="list pro">
                <div className="item">
                    {status == 'saving' ?
                        <Spinner />
                        :
                        <>
                            <div className="text-white/50">content type</div>

                            <div className='flex flex-row gap-3 text-xl sm:text-4xl'>
                                <div
                                    onClick={() => setContentType('all')}
                                    className={clsx('transition cursor-pointer', contentType == 'all' ? 'text-primary' : 'text-primary/40')}>
                                    all
                                </div>
                                <div
                                    onClick={() => setContentType('favorites')}
                                    className={clsx('transition cursor-pointer', contentType == 'favorites' ? 'text-primary' : 'text-primary/40')}>
                                    favorites
                                </div>
                            </div>
                        </>
                    }
                </div>
            </div>
        </Modal >
    )
}