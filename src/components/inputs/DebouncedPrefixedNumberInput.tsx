import { useState } from "react";
import useDebouncedSetter from "../../hooks/useDebouncedSetter";
import PrefixedNumberInput, { PrefixedNumberInputProps } from "./PrefixedNumberInput";

export default function DebouncedPrefixedNumberInput(props: {
    delay: number,
} & PrefixedNumberInputProps) {
    const [value, setValue] = useState(props.value);

    useDebouncedSetter(value, props.onChange, props.delay);

    return (
        <PrefixedNumberInput
            {...props}
            value={value}
            onChange={setValue} />
    );
}