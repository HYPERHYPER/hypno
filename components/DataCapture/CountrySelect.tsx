import { forwardRef, SelectHTMLAttributes } from "react";
import { getData as getCountries } from 'agegate';
import _ from 'lodash';

interface CountrySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    placeholder?: string;
    error?: boolean;
}


export const CountrySelect = forwardRef<HTMLSelectElement, CountrySelectProps>((props, ref) => {
    const countries = _.orderBy(
        getCountries(),
        [(c) => c.name.toLowerCase()],
        ["asc"]
    );

    return (
        <select
            {...props}
            ref={ref}
            className={`select w-full data-capture ${props.error && 'error text-red-600'}`}>
            <option value="" key='default'>{props.error ? `${props.placeholder} is required` : props.placeholder}</option>
            {countries.map(({ code, name }) => (
                <option key={name} value={name}>
                    {name}
                </option>
            ))}
        </select>
    )
})

CountrySelect.displayName = "CountrySelect";
