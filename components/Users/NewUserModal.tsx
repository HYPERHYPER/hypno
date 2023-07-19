import { useForm } from "react-hook-form";
import FormControl from "../Form/FormControl";
import Modal from "../Modal";
import _ from 'lodash';
import clsx from "clsx";
import { useContext, useState } from "react";
import { SaveStatus } from "../Form/AutosaveStatusText";
import axios from "axios";
import useUserStore from "@/store/userStore";
import { PrivilegeContext } from "../PrivilegeContext/PrivilegeContext";

const userRoles = [
    { name: 'member', id: 3 },
    { name: 'admin', id: 2 }
];

export default function NewUserModal() {
    const { userPrivileges } = useContext(PrivilegeContext);

    const user = useUserStore.useUser();
    const token = useUserStore.useToken();

    const [status, setStatus] = useState<SaveStatus>('ready');
    const {
        register,
        setValue,
        watch,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            email: '',
            role: 3,
        }
    })

    const inviteData = watch();
    const inviteUser = async (data: any) => {
        setStatus('saving');

        if (!_.isEmpty(errors)) {
            console.log("submitForm errors", { errors });
            setStatus('error');
            return;
        }

        let payload = {
            invite: {
                ...data,
                organization_id: user.organization.id,
                inviter_user_id: user.id,
            }
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/invite`;
        await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token.access_token,
            },
        }).then((res) => {
            console.log(res)
            setStatus('success')
            setTimeout(() => {
                setStatus('ready');
                reset();
            }, 3000)
        }).catch((e) => {
            console.log(e);
            setStatus('error')
        })
    }

    return (
        <Modal
            title='new user'
            id='new-user-modal'
            menu={
                <>
                    <h2 className="text-primary"><label htmlFor={'new-user-modal'} className="cursor-pointer" onClick={() => { reset(); setStatus('ready'); }}>cancel</label></h2>
                    {status == 'error' && <h2 className="text-red-500">oops! error...</h2>}
                </>
            }
            actionBtn={{
                status,
                text: 'invite',
                onClick: () => handleSubmit(inviteUser)()
            }}
        >
            {status != 'success' ? (
                <div className='list pro'>
                    <FormControl label='organization'>
                        <span className='text-right lowercase text-white text-xl sm:text-4xl'>{user?.organization.name}</span>
                    </FormControl>
                    <FormControl label='email'>
                        <input className='input pro w-full pr-0' {...register('email')} />
                    </FormControl>
                    <FormControl label='role'>
                        <div className='flex gap-3 text-xl sm:text-4xl'>
                            {_.map(userRoles, (u, i) => {
                                if ((!userPrivileges?.canInviteAdmin && u.id == 2) || (!userPrivileges?.canInviteMember && u.id == 3)) return null;
                                return (
                                    <span key={i} onClick={() => setValue('role', u.id)} className={clsx('cursor-pointer transition', u.id == inviteData.role ? 'text-primary' : 'text-primary/40')}>{u.name}</span>
                            )})}
                        </div>
                    </FormControl>
                </div>
            ) : (
                <div className='list pro'>
                    <div className='item'>
                        <h2 className="text-white">your invite was sent!</h2>
                    </div>
                </div>
            )}

        </Modal>
    )
}
