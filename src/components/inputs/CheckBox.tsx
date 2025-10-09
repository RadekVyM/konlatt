import { LuCheck } from "react-icons/lu";
import { cn } from "../../utils/tailwind";
import "./CheckBox.css";

export default function CheckBox({ className, children, ...rest }: {
    className?: string,
    children?: React.ReactNode,
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label
            className={cn("checkbox w-fit flex gap-2 items-center text-sm cursor-pointer select-none", className)}>
            <input
                type="checkbox"
                className="accent-primary mb-[2px] border-outline sr-only"
                {...rest} />
            <LuCheck
                className={cn(
                    "w-4 h-4 p-0.5 border rounded-sm")} />
            {children}
        </label>
    );
}