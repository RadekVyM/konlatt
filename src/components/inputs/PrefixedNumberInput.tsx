import { cn } from "../../utils/tailwind";
import NumberInput, { NumberInputProps } from "./NumberInput";

export type PrefixedNumberInputProps = {
    className?: string,
    prefix: string,
    value: number,
    onChange: (value: number) => void,
} & NumberInputProps

export default function PrefixedNumberInput(props: PrefixedNumberInputProps) {
    return (
        <NumberInput
            {...props}
            inputClassName={cn(props.inputClassName, "pl-7")}>
            <span
                className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-on-surface-container-muted pointer-events-none">
                {props.prefix}
            </span>
        </NumberInput>
    );
}