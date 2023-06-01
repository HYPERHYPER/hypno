import { forwardRef, useState, InputHTMLAttributes } from "react";
import _ from 'lodash';

interface DateInputProps extends InputHTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    error?: boolean;
}

const isValidDate = (value: string) => !_.isEmpty(value) && value !== 'Invalid Date'

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({value, ...rest}, ref) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);

    return (
        <div className="relative h-12 sm:h-[4rem] w-full">
            <input
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
            }
        </div>
    )
})

DateInput.displayName = "DateInput";
