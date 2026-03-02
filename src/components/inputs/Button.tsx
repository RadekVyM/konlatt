import { Link } from "react-router-dom";
import { cn } from "../../utils/tailwind";
import { useRef } from "react";
import Tooltip from "../Tooltip";

type ButtonVariant =
    "default" | "destructive" | "primary" | "secondary" | "container" | "plain" |
    "icon-default" | "icon-destructive" | "icon-primary" | "icon-secondary" | "icon-container" | "icon-plain" |
    "dynamic-xs-default" | "dynamic-xs-destructive" | "dynamic-xs-primary" | "dynamic-xs-secondary" | "dynamic-xs-container" | "dynamic-xs-plain" |
    "dynamic-sm-default" | "dynamic-sm-destructive" | "dynamic-sm-primary" | "dynamic-sm-secondary" | "dynamic-sm-container" | "dynamic-sm-plain";

type ButtonSize = "none" | "default" | "sm" | "lg";

/** All the possible variants of a button. */
const VARIANTS: Record<ButtonVariant, string> = {
    default: "btn-default",
    destructive: "btn-destructive",
    primary: "btn-primary",
    secondary: "btn-secondary",
    container: "btn-container",
    plain: "",
    "icon-default": "btn-default btn-icon px-0",
    "icon-destructive": "btn-destructive btn-icon px-0",
    "icon-primary": "btn-primary btn-icon px-0",
    "icon-secondary": "btn-secondary btn-icon px-0",
    "icon-container": "btn-container btn-icon px-0",
    "icon-plain": "",
    "dynamic-xs-default": "btn-default btn-dynamic-xs max-[30rem]:px-0",
    "dynamic-xs-destructive": "btn-destructive btn-dynamic-xs max-[30rem]:px-0",
    "dynamic-xs-primary": "btn-primary btn-dynamic-xs max-[30rem]:px-0",
    "dynamic-xs-secondary": "btn-secondary btn-dynamic-xs max-[30rem]:px-0",
    "dynamic-xs-container": "btn-container btn-dynamic-xs max-[30rem]:px-0",
    "dynamic-xs-plain": "",
    "dynamic-sm-default": "btn-default btn-dynamic-sm max-sm:px-0",
    "dynamic-sm-destructive": "btn-destructive btn-dynamic-sm max-sm:px-0",
    "dynamic-sm-primary": "btn-primary btn-dynamic-sm max-sm:px-0",
    "dynamic-sm-secondary": "btn-secondary btn-dynamic-sm max-sm:px-0",
    "dynamic-sm-container": "btn-container btn-dynamic-sm max-sm:px-0",
    "dynamic-sm-plain": "",
};

const SIZES: Record<ButtonSize, string> = {
    none: "",
    default: "btn-md",
    sm: "btn-sm",
    lg: "btn-lg",
};

export type ButtonVariantProps = {
    variant?: ButtonVariant,
    size?: ButtonSize,
}

export default function Button({ className, to, target, rel, variant, size, disabled, title, ref, shortcutKeys, ...rest }: {
    children: React.ReactNode,
    className?: string,
    shortcutKeys?: string,
    to?: string,
    target?: string,
    rel?: string,
    reloadDocument?: boolean,
    ref?: React.RefObject<HTMLElement | null>,
} & React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariantProps) {
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
                    className={cn(buttonClassName(variant || "default", size || "default"), className, disabled && "pointer-events-none opacity-50")}
                    children={rest.children} /> :
                <button
                    ref={setRefs}
                    aria-label={title}
                    {...rest}
                    disabled={disabled}
                    className={cn(buttonClassName(variant || "default", size || "default"), className)} />}
            {title &&
                <Tooltip
                    tooltip={title}
                    elementRef={elementRef}
                    shortcutKeys={shortcutKeys} />}
        </>
    );
}

function buttonClassName(
    variant: ButtonVariant,
    size: ButtonSize,
) {
    const isIcon = variant.startsWith("icon-");
    const isDynamicXs = variant.startsWith("dynamic-xs-");
    const isDynamicSm = variant.startsWith("dynamic-sm-");

    const compound = cn(
        isIcon && {
            "min-w-8": size === "default",
            "min-w-7": size === "sm",
            "min-w-10": size === "lg",
        },
        isDynamicXs && {
            "max-[30rem]:min-w-8": size === "default",
            "max-[30rem]:min-w-7": size === "sm",
            "max-[30rem]:min-w-10": size === "lg",
        },
        isDynamicSm && {
            "max-sm:min-w-8": size === "default",
            "max-sm:min-w-7": size === "sm",
            "max-sm:min-w-10": size === "lg",
        }
    );

    return cn("btn", VARIANTS[variant], SIZES[size], compound);
}