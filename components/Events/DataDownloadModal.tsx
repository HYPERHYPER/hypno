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

interface Props {
    modalId: string;
    eventId: string;
}

export default function DataDownloadModal({ modalId, eventId }: Props) {
    const { access_token } = useUserStore.useToken();
    const [status, setStatus] = useState<SaveStatus>('ready');
    const [password, setPassword] = useState<string>('');

    const [copied, setCopied] = useState<boolean>(false);
    const handleCopied = () => {
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 3000);
    }

    const downloadZipFile = (zipBlob: string) => {
        try {
            // Step 1: Create a FileSaver Blob object
            const file = new Blob([zipBlob], { type: 'application/zip' });

            // Step 2: Save the Blob as a downloadable file
            saveAs(file, `hypno_data_${eventId}.zip`);
            setStatus('success');
        } catch (error) {
            console.error('Error saving zip file:', error);
        }
    }

    const handleDataDownload = async () => {
        setStatus('saving');
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventId}/data_zip`;
        const token = access_token;
        await axios.get(url, {
            responseType: 'blob',
            headers: {
                Authorization: 'Bearer ' + token,
            },
        }).then(async (res) => {
            if (res.status === 200) {
                const zipPw = res.headers['zip-pw'] || '';
                const zipBlob = res.data;
                setPassword(zipPw);
                downloadZipFile(zipBlob);
                setTimeout(() => {
                    setStatus('ready')
                }, 3000);
            }
        }).catch((e) => {
            console.log(e);
            setStatus('error');
        });
    }


    return (
        <Modal
            id={modalId}
            title={'data'}
            menu={<h2 className="text-white/50">{_.isEmpty(password) ? 'download captured data from your event to a password-protected zip file' : 'check your downloads and use the password to unlock zip file'}</h2>}
            actionBtn={{
                status,
                text: 'download',
                onClick: () => handleDataDownload()
            }}
        >
            {!_.isEmpty(password) &&
                (<div className="list pro">
                    <div className="item">
                        <h2 className="text-white/50">password</h2>
                        <CopyToClipboard text={password} onCopy={handleCopied}>
                            <h2 className="group cursor-pointer text-primary flex flex-row items-center gap-2 sm:gap-4">
                                {password}
                                <span className={clsx("swap swap-rotate group-hover:text-white text-white/50 sm:scale-150 transition", copied && 'swap-active')}>
                                    <span className="swap-off"><Duplicate /></span>
                                    <span className="swap-on text-white"><Checkmark /></span>
                                </span>
                            </h2>
                        </CopyToClipboard>
                    </div>
                </div>
                )}
        </Modal>
    )
}