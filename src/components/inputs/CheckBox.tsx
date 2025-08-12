import { cn } from "../../utils/tailwind";

export default function CheckBox({ className, children, ...rest }: {
    className?: string,
    children?: React.ReactNode,
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label
            className={cn("flex gap-2 items-center text-sm", className)}>
            <input
                type="checkbox"
                className="accent-primary mb-[2px] border-outline"
                {...rest} />
            {children}
        </label>
    );
}