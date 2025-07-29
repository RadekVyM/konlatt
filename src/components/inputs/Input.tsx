import { cn } from "../../utils/tailwind";

export default function Input({ className, ref, ...rest }: {
    className?: string,
    ref?: React.RefObject<HTMLInputElement | null>,
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            ref={ref}
            size={1}
            className={cn(
                "disabled:opacity-50 text-sm bg-surface-light-dim-container hover:bg-surface-dim-container border border-surface-light-dim-container hover:border-outline px-2 py-1.5 rounded-md",
                className)}
            {...rest} />
    );
}