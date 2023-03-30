import { forwardRef, useState, InputHTMLAttributes } from "react";
import _ from 'lodash';

interface DateInputProps extends InputHTMLAttributes<HTMLInputElement> {
    hasvalue?: boolean;
    name?: string;
    error?: boolean;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>((props, ref) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);

    return (
        <div className="relative input">
            <input
                {...props}
                type='date'
                ref={ref}
                className={`input data-capture w-full absolute top-0 left-0 ${props.error && 'error text-red-600'}`}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {!isFocused && !props.hasvalue &&
                <div 
                    onClick={() => setIsFocused(true)}
                    className={`absolute inset-0 flex items-center w-full data-capture input ${props.error && 'error text-red-600'}`}>{props.error ? `${props.name} is required` : props.name}</div>
            }
        </div>
    )
})

DateInput.displayName = "DateInput";
