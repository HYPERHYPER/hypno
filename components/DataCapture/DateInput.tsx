import { forwardRef, useState, InputHTMLAttributes } from "react";
import _ from 'lodash';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';


interface DateInputProps extends InputHTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    error?: boolean;
    updateValue?: (value?: any) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({ ...rest }, ref) => {
    const [focused, setFocused] = useState<boolean>(false);
    const [value, setValue] = useState<string>('')

    // const formatDate = (dateString: string): string => {
    //     const date = new Date(dateString);
    //     if (isNaN(date.getTime())) return ''; // If date is invalid, return empty string
    //     const month = (date.getMonth() + 1).toString().padStart(2, '0');
    //     const day = date.getDate().toString().padStart(2, '0');
    //     const year = date.getFullYear().toString();
    //     return `${month}/${day}/${year}`;
    // };

    const handleValueChange = (e: any) => {
        const value = e.target.value
        setValue(value);
        rest.updateValue && rest.updateValue(value);
        if (_.isNil(value)) setFocused(false);
    }

    return (
        <div className="relative sm:h-[4rem]">
            {/* <input
                type="text" // Use text type instead of date
                className={`absolute inset-0 input data-capture w-full ${rest.error && 'error text-red-600'}`}
                onChange={handleValueChange}
                value={formatDate(value)} // Format the value before rendering
                maxLength={10} // Enforce maximum length for MM/DD/YYYY format
                placeholder="mm/dd/yyyy"
            /> */}
            <input 
                type="date" 
                className={`absolute inset-0 input data-capture w-full ${rest.error && 'error text-red-600'}`}
                onChange={handleValueChange}
                value={value}
                max="9999-12-31"
                />
            {!focused && <input className="absolute inset-0 input data-capture cursor-pointer" placeholder="birthday" onClick={() => setFocused(true)} />}
        </div>
    )
})

DateInput.displayName = "DateInput";
