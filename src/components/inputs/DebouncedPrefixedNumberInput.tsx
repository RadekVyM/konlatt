import { useEffect, useState } from "react";
import useDebouncedSetter from "../../hooks/useDebouncedSetter";
import PrefixedNumberInput, { PrefixedNumberInputProps } from "./PrefixedNumberInput";

export default function DebouncedPrefixedNumberInput(props: {
    delay: number,
} & PrefixedNumberInputProps) {
    const [value, setValue] = useState(props.value);

    useDebouncedSetter(value, () => {
        if (value !== undefined && value !== props.value) {
            props.onChange?.(value);
        }
    }, props.delay);

    useEffect(() => {
        if (value !== props.value) {
            setValue(props.value);
        }
    }, [props.value]);

    return (
        <PrefixedNumberInput
            {...props}
            value={value}
            onChange={setValue} />
    );
}