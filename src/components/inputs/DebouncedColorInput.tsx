import { useEffect, useState } from "react";
import ColorInput, { ColorInputProps } from "./ColorInput";
import useDebouncedSetter from "../../hooks/useDebouncedSetter";

export default function DebouncedColorInput(props: {
    delay: number,
} & ColorInputProps) {
    const [color, setColor] = useState(props.color);

    useDebouncedSetter(color, () => {
        if (color !== undefined && color !== props.color) {
            props.onChange?.(color);
        }
    }, props.delay);

    useEffect(() => {
        if (color !== props.color) {
            setColor(props.color);
        }
    }, [props.color]);

    return (
        <ColorInput
            {...props}
            color={color}
            onChange={setColor} />
    );
}