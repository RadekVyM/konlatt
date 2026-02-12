import { Link } from "react-router-dom";
import { VariantProps } from "class-variance-authority";
import { cn } from "../../utils/tailwind";
import { buttonVariants } from "../variants/buttonVariants";
import { useRef } from "react";
import Tooltip from "../Tooltip";

export default function Button({ className, to, target, rel, variant, size, disabled, title, ref, shortcutKeys, ...rest }: {
    children: React.ReactNode,
    className?: string,
    shortcutKeys?: string,
    to?: string,
    target?: string,
    rel?: string,
    reloadDocument?: boolean,
    ref?: React.RefObject<HTMLElement | null>,
} & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
    const elementRef = useRef<HTMLElement>(null);

    function setRefs(node: HTMLElement | null) {
        elementRef.current = node;
        if (typeof ref === "function") {
            (ref as any)(node);
        }
        else if (ref) {
            ref.current = node;
        }
    }

    return (
        <>
            {to ?
                <Link
                    ref={setRefs}
                    aria-label={title}
                    to={to}
                    target={target}
                    rel={rel}
                    viewTransition
                    reloadDocument={rest.reloadDocument}
                    className={cn(buttonVariants({ variant, size, className }), disabled && "pointer-events-none opacity-50")}
                    children={rest.children} /> :
                <button
                    ref={setRefs}
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