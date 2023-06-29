import { useForm } from "react-hook-form";
import FormControl from "../Form/FormControl";
import Modal from "../Modal";
import { SaveStatus } from "../Form/AutosaveStatusText";
import { useState } from "react";
import useUserStore from "@/store/userStore";
import axios from "axios";
import _ from 'lodash';

export default function UpdatePasswordModal() {
    const user = useUserStore.useUser();
    const token = useUserStore.useToken();
    const [status, setStatus] = useState<SaveStatus>('ready')
    const {
        register,
        reset,
        formState: { errors },
        handleSubmit,
    } = useForm({
        defaultValues: {
            current_password: '',
            new_password: '',
            confirm_password: ''
        }
    });

    const handleUpdatePassword = async (data: any) => {
        setStatus('saving');
        const { current_password, new_password, confirm_password } = data;

        const isPasswordConfirmed = new_password == confirm_password;
        if (!_.isEmpty(errors) || !isPasswordConfirmed) {
            console.log("submitForm errors", { errors });
            setStatus('error');
            return;
        }

        let payload = {
            user: {
                current_password,
                new_password,
            }
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/users/${user.id}/update_password`;
        await axios.put(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token.access_token,
            },
        }).then((res) => {
            setStatus('success');
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
            id='password-modal'
            title='change password'
            menu={
                <>
                    {/* <h2 className="text-white/40">forgot password?</h2> */}
                    <h2 className="text-primary"><label htmlFor={'password-modal'} className="cursor-pointer" onClick={() => {reset(); setStatus('ready');}}>cancel</label></h2>
                    {status == 'error' && <h2 className="text-red-500">oops! error...</h2>}
                </>
            }
            actionBtn={{
                status,
                text: 'save',
                onClick: () => handleSubmit(handleUpdatePassword)(),
            }}
        >
            <div className='list pro'>
                <FormControl label='current password'>
                    <input {...register('current_password')} className='input pro' type='password' />
                </FormControl>
                <FormControl label='new password'>
                    <input {...register('new_password', { minLength: 3 })} className='input pro' type='password' />
                </FormControl>
                <FormControl label='confirm password'>
                    <input {...register('confirm_password', { minLength: 3 })} className='input pro' type='password' />
                </FormControl>
            </div>
        </Modal>
    )
}