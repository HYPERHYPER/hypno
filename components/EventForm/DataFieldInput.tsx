import Flower from "assets/icons/flower.svg"
import clsx from "clsx"
import _ from "lodash";
import Minus from 'public/pop/minus.svg';
import AngleUp from 'public/pop/angle-up.svg';
import AngleDown from 'public/pop/angle-down.svg';

export type FieldType = 'birthday' | 'birthday-13' | 'birthday-18' | 'birthday-21' | 'country' | 'date' | 'email' | 'phone' | 'text' | 'checkbox' | 'wallet' | 'zip'
export type FieldValue = {
    required?: boolean;
    name?: string;
    type?: FieldType;
    label?: string;
}
interface DataFieldInputProps {
    value?: FieldValue;
    onRemove?: () => void;
    onChange?: (value: FieldValue) => void;
    onReorder?: (dir: 'up' | 'down') => void;
}

export function FieldSelect({ value, onSelect, resetOnSelect }: { value?: FieldType, onSelect: (value: string) => void, resetOnSelect?: boolean }) {
    const handleChange = (e: any) => {
        const selectedValue = e.target.value;
        onSelect(selectedValue);

        // Reset the value to an empty string after selection
        if (resetOnSelect && selectedValue !== "") {
            e.target.value = "";
        }
    };

    return (
        <select
            id="fields"
            className={clsx('select sm:w-52 rounded-full lowercase sm:text-xl font-medium tracking-tight transition focus:outline-none',
                !_.isEmpty(value) ? 'bg-white/20 text-white focus:bg-white/20 focus:text-white' : 'bg-primary text-black focus:bg-primary focus:text-black'
            )}
            value={value}
            onChange={handleChange}
        >
            {_.isEmpty(value) && <option value="">add field</option>}
            <option value="text">Text</option>
            <option value="birthday">Birthday</option>
            <option value="birthday-13">Birthday 13+</option>
            <option value="birthday-18">Birthday 18+</option>
            <option value="birthday-21">Birthday 21+</option>
            <option value="checkbox">Checkbox</option>
            <option value="country">Country</option>
            <option value="date">Date</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="zip">Zip Code</option>
        </select>
    )
}

const Required = ({ active, onClick }: { active?: boolean, onClick: () => void }) => <div onClick={onClick} className="cursor-pointer bg-white/20 rounded-full w-12 h-12 flex items-center justify-center tooltip tooltip-primary font-medium" data-tip='required'><div className={clsx("icon icon-sm transition", active ? 'primary' : 'grey')}><Flower /></div></div>
const Remove = ({ onClick }: { onClick?: () => void }) => <div onClick={(e) => {e.preventDefault(); onClick && onClick();}} className="icon cursor-pointer bg-white/20 rounded-full w-12 h-12 flex items-center justify-center text-black"><Minus /></div>

export default function DataFieldInput({
    value = { required: false, name: "", type: undefined, label: "" },
    onRemove,
    onChange,
    onReorder,
}: DataFieldInputProps) {
    const {
        required,
        name,
        type,
        label
    } = value;

    const typeSelected = !_.isEmpty(type);
    const ageValidation = String(type).split("-")[1]
    const handleChange = (key: string, updatedValue?: boolean | string | FieldType) => {
        onChange && onChange({
            ...value,
            [key]: updatedValue,
        })
    }

    return (
        <div className="py-5 border-b-2 border-white/20 min-h-[60px] w-full">
            <div className={clsx("flex", type != 'checkbox' ? 'flex-row justify-between items-center' : 'flex-col gap-3')}>
                <div className="flex flex-row gap-2 items-center">
                    <FieldSelect value={type} onSelect={(value) => handleChange('type', value)} />
                    {typeSelected && !ageValidation && <Required active={required} onClick={() => handleChange('required', !required)} />}
                    {typeSelected && <Remove onClick={onRemove} />}
                    <div className="flex flex-col items-center justify-center">
                        <div onClick={() => onReorder && onReorder('up')} className="cursor-pointer w-6 h-6 flex items-center justify-center hover:text-primary transition"><AngleUp /></div>
                        <div onClick={() => onReorder && onReorder('down')} className="cursor-pointer w-6 h-6 flex items-center justify-center hover:text-primary transition"><AngleDown /></div>
                    </div>
                </div>
                {type == 'checkbox' && (
                    <h3 className="text-white/40 sm:text-xl">{'format links like <link|https://domain.com>'}</h3>
                )}
                {typeSelected &&
                    type != 'checkbox' ? (
                    <input
                        className={clsx('pr-0 input pro w-full')}
                        placeholder={String(type).split("-")[0]}
                        value={name}
                        onChange={(e) => {
                            handleChange('name', e.target.value)
                        }} />
                ) : (
                    <textarea
                        className={clsx('pr-0 textarea pro left')}
                        placeholder={'by tapping to get your content, you accept the <terms of use|https://abc.xyz>'}
                        value={label}
                        onChange={(e) => {
                            handleChange('label', e.target.value)
                        }} />
                )}
            </div>

            {ageValidation && <h3 className="mt-3 text-white/40 sm:text-xl">users must enter their birthday and be {ageValidation}+ to continue</h3>}
        </div>
    )
}