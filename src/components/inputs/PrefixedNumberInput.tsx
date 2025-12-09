import NumberInput from "./NumberInput";

export type PrefixedNumberInputProps = {
    className?: string,
    prefix: string,
    value: number,
    onChange: (value: number) => void,
}

export default function PrefixedNumberInput(props: PrefixedNumberInputProps) {
    return (
        <NumberInput
            className={props.className}
            min={0}
            inputClassName="pl-7"
            value={props.value}
            onChange={props.onChange}>
            <span
                className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-on-surface-container-muted pointer-events-none">
                {props.prefix}
            </span>
        </NumberInput>
    );
}