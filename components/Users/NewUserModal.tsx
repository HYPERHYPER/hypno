import FormControl from "../Form/FormControl";
import Modal from "../Modal";

export default function NewUserModal() {
    return (
        <Modal title='new user' id='new-user-modal'>
            <div className='list pro'>
                <FormControl label='email'>
                    <input className='input pro' />
                </FormControl>
                <FormControl label='role'>
                    <div className='flex gap-3 text-4xl'>
                        <span className='text-primary'>member</span>
                        <span className='text-primary/40'>admin</span>
                    </div>
                </FormControl>
            </div>
        </Modal>
    )
}