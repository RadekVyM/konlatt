import { useEffect, useState } from "react";
import useDebouncedSetter from "../../hooks/useDebouncedSetter";
import NumberInput, { NumberInputProps } from "./NumberInput";

export default function DebouncedNumberInput(props: {
    delay: number,
} & NumberInputProps) {
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
        <NumberInput
            {...props}
            value={value}
            onChange={setValue} />
    );
}