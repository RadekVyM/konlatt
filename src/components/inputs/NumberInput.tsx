import React, { useRef } from "react";
import { cn } from "../../utils/tailwind";
import Input from "./Input";
import InputLabel from "./InputLabel";

export type NumberInputProps = {
    className?: string,
    inputClassName?: string,
    label?: string,
    minimumFractionDigits?: number,
    children?: React.ReactNode,
    value?: number,
    onChange?: (value: number) => void,    
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">

export default function NumberInput({
    className,
    inputClassName,
    id,
    label,
    minimumFractionDigits,
    children,
    value,
    onChange,
    ...rest
}: NumberInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className={cn("relative", className)}>
            {label &&
                <InputLabel
                    htmlFor={id}>
                    {label}
                </InputLabel>}
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
            {children}
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