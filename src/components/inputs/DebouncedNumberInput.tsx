import { useState } from "react";
import useDebouncedSetter from "../../hooks/useDebouncedSetter";
import NumberInput, { NumberInputProps } from "./NumberInput";

export default function DebouncedNumberInput(props: {
    delay: number,
} & NumberInputProps) {
    const [value, setValue] = useState(props.value);

    useDebouncedSetter(value, () => {
        if (value !== undefined) {
            props.onChange?.(value);
        }
    }, props.delay);

    return (
        <NumberInput
            {...props}
            value={value}
            onChange={setValue} />
    );
}