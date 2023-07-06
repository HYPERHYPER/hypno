import { forwardRef, useState, InputHTMLAttributes } from "react";
import _ from 'lodash';
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";

interface DateInputProps extends InputHTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    error?: boolean;
    updateValue?: (value?: any) => void;
}

// const isValidDate = (value: string) => !_.isEmpty(value) && value !== 'Invalid Date'

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({ ...rest }, ref) => {
    const [value, setValue] = useState<DateValueType>({ startDate: null, endDate: null })
    const handleValueChange = (newValue: DateValueType) => {
        console.log("newValue:", newValue);
        setValue(newValue);
        rest.updateValue && rest.updateValue(newValue?.startDate);
    }

    {/* <input
                {...rest}
                placeholder={rest.name}
                type='date'
                ref={ref}
                className={`input data-capture w-full absolute inset-0 ${rest.error && 'error text-red-600'}`}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{ boxSizing: 'border-box' }}
            />
            {!isFocused && !isValidDate(String(value)) &&
                <div 
                    onClick={() => setIsFocused(true)}
                    style={{ boxSizing: 'border-box' }}
                    className={`absolute inset-0 flex items-center w-full input data-capture border-none ${rest.error && 'error text-red-600'}`}>{rest.error ? `${rest.placeholder} is required` : rest.placeholder}</div>
            } */}

    return (
        <Datepicker
            {...rest}
            inputId={rest.id}
            value={value}
            asSingle={true}
            placeholder={rest.placeholder}
            onChange={handleValueChange}
            useRange={false}
            maxDate={new Date()}
            inputClassName={`input data-capture w-full ${rest.error && 'error text-red-600'}`}
        />
    )
})

DateInput.displayName = "DateInput";
