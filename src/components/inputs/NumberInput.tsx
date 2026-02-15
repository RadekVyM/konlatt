import React, { useEffect, useState } from "react";
import { cn } from "../../utils/tailwind";
import Input from "./Input";
import InputLabel from "./InputLabel";
import Button from "./Button";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

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
    const numberStep = rest.step === undefined ?
        1 :
        toNumber(rest.step);
    // Local string representation for "dirty" typing (e.g., "1.")
    const [inputValue, setInputValue] = useState<string>(value !== undefined ? formatNumber(value, minimumFractionDigits || 0) : "");

    useEffect(() => {
        if (value !== undefined && parseFloat(inputValue) !== value) {
            setInputValue(formatNumber(value, minimumFractionDigits || 0));
        }
    }, [value, minimumFractionDigits]);

    function onSpinnerClick(delta: number) {
        let newValue = (value || 0) + delta;
        if (rest.max !== undefined) {
            newValue = Math.min(newValue, toNumber(rest.max));
        }
        if (rest.min !== undefined) {
            newValue = Math.max(newValue, toNumber(rest.min));
        }

        onChange?.(newValue);
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        // Allow only numbers and one decimal point
        if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
            setInputValue(value);
            const parsedValue = parseFloat(value);
            onChange?.(isNaN(parsedValue) ? 0 : parsedValue);
        }
    }

    function onInputBlur() {
        // Clean up the formatting on blur (e.g., "1." becomes "1.00")
        const parsed = parseFloat(inputValue);
        setInputValue(formatNumber(isNaN(parsed) ? 0 : parsed, minimumFractionDigits || 0));
    }

    return (
        <div className={cn("relative flex flex-col justify-end", className)}>
            {label &&
                <InputLabel
                    className="w-fit"
                    htmlFor={id}>
                    {label}
                </InputLabel>}
            <div
                className="grid grid-cols-[1fr_calc(var(--spacing)*5)] grid-rows-2">
                <Input
                    id={id}
                    type="text"
                    inputMode="decimal"
                    value={inputValue}
                    onChange={onInputChange}
                    onBlur={onInputBlur}
                    onFocus={(e) => e.target.select()}
                    className={cn("w-full row-start-1 row-end-3 rounded-r-none", inputClassName)}
                    {...rest} />
                {children}
                <Button
                    size="none"
                    variant="secondary"
                    className="text-xs w-full place-content-center rounded-none rounded-tr-md"
                    title="Increase"
                    onClick={() => onSpinnerClick(numberStep)}>
                    <LuChevronUp
                        className="-mb-0.5" />
                </Button>
                <Button
                    size="none"
                    variant="secondary"
                    className="text-xs w-full place-content-center rounded-none rounded-br-md"
                    title="Decrease"
                    onClick={() => onSpinnerClick(-numberStep)}>
                    <LuChevronDown
                        className="-mt-0.5" />
                </Button>
            </div>
        </div>
    );
}

function formatNumber(num: number, minDigits: number) {
    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: 20,
        useGrouping: false,
    }).format(num);
}

function toNumber(num: number | string) {
    return typeof num === "string" ?
        parseFloat(num) :
        num;
}