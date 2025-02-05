import { Link } from "react-router-dom";
import { VariantProps } from "class-variance-authority";
import { cn } from "../../utils/tailwind";
import { buttonVariants } from "../variants/buttonVariants";

export default function Button({ className, to, variant, size, disabled, ...rest }: {
    children: React.ReactNode,
    className?: string,
    to?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
    return to ?
        <Link
            to={to}
            className={cn(buttonVariants({ variant, size, className }), disabled && "pointer-events-none opacity-50")}
            children={rest.children} /> :
        <button
            {...rest}
            disabled={disabled}
            className={cn(buttonVariants({ variant, size, className }))} />
}