import { cva } from "class-variance-authority";

/** All the possible variants of a button. */
export const buttonVariants = cva(
    "btn",
    {
        variants: {
            variant: {
                default:
                    "btn-default",
                destructive:
                    "btn-destructive",
                primary:
                    "btn-primary",
                secondary:
                    "btn-secondary",
                container:
                    "btn-container",
                "icon-default":
                    "btn-default btn-icon px-0",
                "icon-destructive":
                    "btn-destructive btn-icon px-0",
                "icon-primary":
                    "btn-primary btn-icon px-0",
                "icon-secondary":
                    "btn-secondary btn-icon px-0",
                "icon-container":
                    "btn-container btn-icon px-0",
            },
            size: {
                default: "btn-md",
                sm: "btn-sm",
                lg: "btn-lg",
            },
        },
        compoundVariants: [
            {
                variant: ["icon-container", "icon-default", "icon-destructive", "icon-primary", "icon-secondary"],
                size: "default",
                className: "min-w-8",
            },
            {
                variant: ["icon-container", "icon-default", "icon-destructive", "icon-primary", "icon-secondary"],
                size: "sm",
                className: "min-w-7",
            },
            {
                variant: ["icon-container", "icon-default", "icon-destructive", "icon-primary", "icon-secondary"],
                size: "lg",
                className: "min-w-10",
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);