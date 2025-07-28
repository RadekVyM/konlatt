import { Link } from "react-router-dom";
import { VariantProps } from "class-variance-authority";
import { cn } from "../../utils/tailwind";
import { buttonVariants } from "../variants/buttonVariants";
import { useRef } from "react";
import Tooltip from "../Tooltip";

export default function Button({ className, to, variant, size, disabled, title, ref, shortcutKeys, ...rest }: {
    children: React.ReactNode,
    className?: string,
    shortcutKeys?: string,
    to?: string,
    ref?: React.RefObject<HTMLElement | null>,
} & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
    const elementRef = useRef<HTMLElement>(null);

    if (ref) {
        ref.current = elementRef.current;
    }

    return (
        <>
            {to ?
                <Link
                    ref={elementRef as any}
                    aria-label={title}
                    to={to}
                    viewTransition
                    className={cn(buttonVariants({ variant, size, className }), disabled && "pointer-events-none opacity-50")}
                    children={rest.children} /> :
                <button
                    ref={elementRef as any}
                    aria-label={title}
                    {...rest}
                    disabled={disabled}
                    className={cn(buttonVariants({ variant, size, className }))} />}
            {title &&
                <Tooltip
                    tooltip={title}
                    elementRef={elementRef}
                    shortcutKeys={shortcutKeys} />}
        </>
    );
}