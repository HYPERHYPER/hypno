import { forwardRef, useState, InputHTMLAttributes } from "react";
import _ from 'lodash';
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import DatePicker from 'react-date-picker';
import 'react-calendar/dist/Calendar.css';


type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface DateInputProps extends InputHTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    error?: boolean;
    updateValue?: (value?: any) => void;
}

// const isValidDate = (value: string) => !_.isEmpty(value) && value !== 'Invalid Date'

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({ ...rest }, ref) => {
    const [focused, setFocused] = useState<boolean>(false);
    const [value, setValue] = useState<Value>(null)
    const handleValueChange = (newValue: Value) => {
        setValue(newValue);
        rest.updateValue && rest.updateValue(newValue);
        if (_.isNil(newValue)) setFocused(false);
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
        <div className="relative">
            <DatePicker
                calendarClassName='bg-white'
                className={`absolute inset-0 input data-capture w-full ${rest.error && 'error text-red-600'}`}
                onChange={handleValueChange}
                value={value}
                maxDate={new Date()}
                dayPlaceholder="dd"
                monthPlaceholder="mm"
                yearPlaceholder="yyyy"
                openCalendarOnFocus={false}
                showLeadingZeros={true}
                calendarIcon={false}
                />
            {!focused && <input className="absolute inset-0 input data-capture cursor-pointer" placeholder="birthday" onClick={() => setFocused(true)} />}
        </div>

        // <Datepicker
        //     {...rest}
        //     inputId={rest.id}
        //     value={value}
        //     asSingle={true}
        //     placeholder={rest.placeholder}
        //     onChange={handleValueChange}
        //     useRange={false}
        //     maxDate={new Date()}
        //     inputClassName={`input data-capture w-full ${rest.error && 'error text-red-600'}`}
        // />
    )
})


// import { forwardRef, useState, InputHTMLAttributes } from "react";
// import _ from 'lodash';
// import 'react-date-picker/dist/DatePicker.css';
// import 'react-calendar/dist/Calendar.css';
// import moment from "moment";


// interface DateInputProps extends InputHTMLAttributes<HTMLInputElement> {
//     placeholder?: string;
//     error?: boolean;
//     updateValue?: (value?: any) => void;
// }

// export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({ ...rest }, ref) => {
//     const [focused, setFocused] = useState<boolean>(false);
//     const [value, setValue] = useState<string>('')

//     const formatDate = (dateString: string): string => {
//         if (!dateString) return ''; // If dateString is empty, return empty string
//         console.log(dateString)
//         // const date = new Date(dateString);
//         const date = moment(dateString).format('MM/DD/YYYY')
//         console.log('d', date)
//         return date;
//     };
    

//     const handleValueChange = (e: any) => {
//         const value = e.target.value
//         setValue(value);
//         rest.updateValue && rest.updateValue(value);
//         if (_.isNil(value)) setFocused(false);
//     }

//     return (
//         <div className="relative sm:h-[4rem] w-full input data-capture">
//             <input
//                 type="text" // Use text type instead of date
//                 className={`absolute inset-0 input data-capture w-full ${rest.error && 'error text-red-600'}`}
//                 onChange={handleValueChange}
//                 value={formatDate(value)} // Format the value before rendering
//                 maxLength={10} // Enforce maximum length for MM/DD/YYYY format
//                 placeholder="mm/dd/yyyy"
//                 // pattern="[0-9]{4}/[0-9]{2}/[0-9]{2}"
//             />
//             {/* <input 
//                 type="date" 
//                 className={`absolute inset-0 input data-capture w-full ${rest.error && 'error text-red-600'}`}
//                 onChange={handleValueChange}
//                 value={value}
//                 max="9999-12-31"
//                 pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
//             /> */}
//             {!focused && <input className="absolute inset-0 input data-capture cursor-pointer" placeholder="birthday" onClick={() => setFocused(true)} />}
//         </div>
//     )
// })

DateInput.displayName = "DateInput";
