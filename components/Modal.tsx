import { ReactNode } from 'react';
import { SaveStatus } from './Form/AutosaveStatusText';
import clsx from 'clsx';

interface OrgUser {
  id: number | null;
  username: string | null;
  organization_id: number | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  created_at: string | null;
  roles: Role[] | string | null;
}

interface Role {
  id: number;
  user_id: number;
  event_id: number;
  organization_id: number | null;
  created_at: string;
  updated_at: string;
  authorizer_id: number;
  kind: string;
  status: string;
}

interface TriggerModalProps {
  id?: string;
  children?: ReactNode;
  onClick?: () => void;
}

interface ModalProps {
  user?: OrgUser;
  id?: string;
  children?: ReactNode;
  title?: string;
  onDone?: () => void;
  menu?: ReactNode;
  actionBtn?: {
    status?: SaveStatus;
    text?: string;
    onClick?: () => void;
    hidden?: boolean;
  };
  wide?: boolean;
}

const TriggerModal = ({ id, children, onClick }: TriggerModalProps) => {
  return (
    <label htmlFor={id} className='cursor-pointer' onClick={onClick}>
      {children}
    </label>
  );
};

const btnClassName =
  'tracking-tight btn btn-primary rounded-[20px] btn-block h-[60px] text-2xl cursor-pointer';

export default function Modal({
  title,
  id,
  children,
  onDone,
  menu,
  actionBtn,
  wide,
  user,
}: ModalProps) {
  return (
    <>
      <input type='checkbox' id={id} className='modal-toggle' />
      <label
        htmlFor={id}
        className='modal bg-[#333333]/50 backdrop-blur-[20px] cursor-pointer'
      >
        <label
          htmlFor=''
          className={clsx(
            'modal-box max-w-3xl px-[40px] py-[35px] relative bg-black rounded-[60px] tracking-tight overflow-clip',
            wide ? 'lg:max-w-7xl' : ''
          )}
        >
          <div className='flex justify-between'>
            <div className='space-y-4'>
              <h1 className='text-white'>{title}</h1>
              <div className='flex flex-row gap-4'>
                {/* <h2 className="text-primary"><label htmlFor={id} className="cursor-pointer">cancel</label></h2> */}
                {menu}
              </div>
            </div>
            <label
              htmlFor={id}
              className='h-[30px] sm:h-[60px] w-[30px] sm:w-[60px] flex items-center  cursor-pointer'
            >
              <div className='bg-white/40 w-[30px] sm:w-[60px] h-1 rounded-sm' />
            </label>
          </div>

          <div
            className={`pr-2 mt-5 sm:mt-10 mb-9 max-h-[50vh] overflow-y-scroll ${
              actionBtn && actionBtn.hidden ? 'mb-0' : 'mb-9'
            }`}
          >
            {children}
            {user && (
              <div className='user-details p-4 bg-black-800 rounded-lg text-white'>
                <p className='text-lg font-semibold'>
                  Username: <span className='font-normal'>{user.username}</span>
                </p>
                <p className='text-lg font-semibold'>
                  Email: <span className='font-normal'>{user.email}</span>
                </p>
                <ul className='mt-2 space-y-2'>
                  {Array.isArray(user.roles) &&
                    user.roles.map((role, i) => (
                      <li
                        key={i}
                        className='text-sm bg-black-700 rounded-md p-2'
                      >
                        Event: {role.event_id}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {actionBtn ? (
            actionBtn.hidden ? null : (
              <button
                onClick={actionBtn.onClick}
                className={btnClassName}
                disabled={
                  actionBtn.status == 'success' || actionBtn.status == 'saving'
                }
              >
                {(actionBtn.status == 'ready' || actionBtn.status == 'error') &&
                  actionBtn.text}
                {actionBtn.status == 'saving' && (
                  <span className='loading loading-dots'></span>
                )}
                {actionBtn.status == 'success' && 'success!'}
              </button>
            )
          ) : (
            <label
              htmlFor={id}
              onClick={onDone ? onDone : undefined}
              className={btnClassName}
            >
              done
            </label>
          )}
        </label>
      </label>
    </>
  );
}

Modal.Trigger = TriggerModal;
