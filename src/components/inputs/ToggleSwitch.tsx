import { cn } from "../../utils/tailwind";
import "./ToggleSwitch.css";

export default function ToggleSwitch({ className, children, ...rest }: {
    className?: string,
    children?: React.ReactNode,
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label
            className={cn("switch", className)}>
            {children}
            <input
                type="checkbox"
                {...rest} />
        </label>
    );
}