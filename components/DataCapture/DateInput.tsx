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
        <div className="relative h-12 w-full">
            <input
                {...props}
                type='date'
                ref={ref}
                className={`input data-capture w-full absolute inset-0 ${props.error && 'error text-red-600'}`}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{ boxSizing: 'border-box' }}
            />
            {!isFocused && !props.hasvalue &&
                <div 
                    onClick={() => setIsFocused(true)}
                    style={{ boxSizing: 'border-box' }}
                    className={`absolute inset-0 flex items-center w-full input data-capture border-none ${props.error && 'error text-red-600'}`}>{props.error ? `${props.name} is required` : props.name}</div>
            }
        </div>
    )
})

DateInput.displayName = "DateInput";
