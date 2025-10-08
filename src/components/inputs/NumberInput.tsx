import { useRef } from "react";
import { cn } from "../../utils/tailwind";
import Input from "./Input";

export default function NumberInput({ className, inputClassName, id, label, minimumFractionDigits, value, onChange, ...rest }: {
    className?: string,
    inputClassName?: string,
    label?: string,
    minimumFractionDigits?: number,
    value?: number,
    onChange?: (value: number) => void,    
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className={className}>
            {label &&
                <label
                    htmlFor={id}
                    className="text-sm">
                    {label}
                </label>}
            <Input
                ref={inputRef}
                id={id}
                type="number"
                value={document.activeElement === inputRef.current ?
                    value :
                    formatNumber(value, minimumFractionDigits)}
                onChange={(event) => onChange && onChange(parseFloat(event.target.value) || 0)}
                onFocus={(event) => event.target.select()}
                onBlur={() => {
                    if (inputRef.current?.value) {
                        inputRef.current.value = formatNumber(parseFloat(inputRef.current.value), minimumFractionDigits) || "";
                    }
                }}
                size={1}
                className={cn(
                    "w-full",
                    inputClassName)}
                {...rest} />
        </div>
    );
}

function formatNumber(num?: number, minimumFractionDigits?: number) {
    return num?.toLocaleString(
        undefined,
        {
            minimumFractionDigits: minimumFractionDigits || 0,
            useGrouping: false,
        });
}