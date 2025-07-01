import { useRef } from "react";
import { cn } from "../../utils/tailwind";

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
            <input
                ref={inputRef}
                id={id}
                type="number"
                value={document.activeElement === inputRef.current ?
                    value :
                    value?.toLocaleString(undefined, { minimumFractionDigits: minimumFractionDigits || 0 })}
                onChange={(event) => onChange && onChange(parseFloat(event.target.value) || 0)}
                onFocus={(event) => event.target.select()}
                onBlur={() => {
                    if (inputRef.current?.value) {
                        inputRef.current.value = parseFloat(inputRef.current.value).toLocaleString(undefined, { minimumFractionDigits: minimumFractionDigits || 0 });
                    }
                }}
                size={1}
                className={cn(
                    "text-sm bg-surface-light-dim-container hover:bg-surface-dim-container border border-surface-light-dim-container hover:border-outline px-2 py-1.5 rounded-md w-full",
                    inputClassName)}
                {...rest} />
        </div>
    );
}