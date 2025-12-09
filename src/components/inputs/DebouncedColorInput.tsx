import { useState } from "react";
import ColorInput, { ColorInputProps } from "./ColorInput";
import useDebouncedSetter from "../../hooks/useDebouncedSetter";

export default function DebouncedColorInput(props: {
    delay: number,
} & ColorInputProps) {
    const [color, setColor] = useState(props.color);

    useDebouncedSetter(color, props.onChange, props.delay);

    return (
        <ColorInput
            {...props}
            color={color}
            onChange={setColor} />
    );
}