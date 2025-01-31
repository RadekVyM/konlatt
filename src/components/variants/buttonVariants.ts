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
                container:
                    "btn-container",
                "icon-default":
                    "btn-default btn-icon px-0 aspect-square",
                "icon-destructive":
                    "btn-destructive btn-icon px-0 aspect-square",
                "icon-primary":
                    "btn-primary btn-icon px-0 aspect-square",
                "icon-container":
                    "btn-container btn-icon px-0 aspect-square",
            },
            size: {
                default: "btn-md",
                sm: "btn-sm",
                lg: "btn-lg",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);