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
                plain:
                    "",
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
                "icon-plain":
                    "",
                "dynamic-xs-default":
                    "btn-default btn-dynamic-xs max-[30rem]:px-0",
                "dynamic-xs-destructive":
                    "btn-destructive btn-dynamic-xs max-[30rem]:px-0",
                "dynamic-xs-primary":
                    "btn-primary btn-dynamic-xs max-[30rem]:px-0",
                "dynamic-xs-secondary":
                    "btn-secondary btn-dynamic-xs max-[30rem]:px-0",
                "dynamic-xs-container":
                    "btn-container btn-dynamic-xs max-[30rem]:px-0",
                "dynamic-xs-plain":
                    "",
                "dynamic-sm-default":
                    "btn-default btn-dynamic-sm max-sm:px-0",
                "dynamic-sm-destructive":
                    "btn-destructive btn-dynamic-sm max-sm:px-0",
                "dynamic-sm-primary":
                    "btn-primary btn-dynamic-sm max-sm:px-0",
                "dynamic-sm-secondary":
                    "btn-secondary btn-dynamic-sm max-sm:px-0",
                "dynamic-sm-container":
                    "btn-container btn-dynamic-sm max-sm:px-0",
                "dynamic-sm-plain":
                    "",
            },
            size: {
                none: "",
                default: "btn-md",
                sm: "btn-sm",
                lg: "btn-lg",
            },
        },
        compoundVariants: [
            {
                variant: ["icon-container", "icon-default", "icon-destructive", "icon-primary", "icon-secondary", "icon-plain"],
                size: "none",
                className: "",
            },
            {
                variant: ["icon-container", "icon-default", "icon-destructive", "icon-primary", "icon-secondary", "icon-plain"],
                size: "default",
                className: "min-w-8",
            },
            {
                variant: ["icon-container", "icon-default", "icon-destructive", "icon-primary", "icon-secondary", "icon-plain"],
                size: "sm",
                className: "min-w-7",
            },
            {
                variant: ["icon-container", "icon-default", "icon-destructive", "icon-primary", "icon-secondary", "icon-plain"],
                size: "lg",
                className: "min-w-10",
            },
            {
                variant: ["dynamic-xs-container", "dynamic-xs-default", "dynamic-xs-destructive", "dynamic-xs-primary", "dynamic-xs-secondary", "dynamic-xs-plain"],
                size: "default",
                className: "max-[30rem]:min-w-8",
            },
            {
                variant: ["dynamic-xs-container", "dynamic-xs-default", "dynamic-xs-destructive", "dynamic-xs-primary", "dynamic-xs-secondary", "dynamic-xs-plain"],
                size: "sm",
                className: "max-[30rem]:min-w-7",
            },
            {
                variant: ["dynamic-xs-container", "dynamic-xs-default", "dynamic-xs-destructive", "dynamic-xs-primary", "dynamic-xs-secondary", "dynamic-xs-plain"],
                size: "lg",
                className: "max-[30rem]:min-w-10",
            },
            {
                variant: ["dynamic-sm-container", "dynamic-sm-default", "dynamic-sm-destructive", "dynamic-sm-primary", "dynamic-sm-secondary", "dynamic-sm-plain"],
                size: "default",
                className: "max-sm:min-w-8",
            },
            {
                variant: ["dynamic-sm-container", "dynamic-sm-default", "dynamic-sm-destructive", "dynamic-sm-primary", "dynamic-sm-secondary", "dynamic-sm-plain"],
                size: "sm",
                className: "max-sm:min-w-7",
            },
            {
                variant: ["dynamic-sm-container", "dynamic-sm-default", "dynamic-sm-destructive", "dynamic-sm-primary", "dynamic-sm-secondary", "dynamic-sm-plain"],
                size: "lg",
                className: "max-sm:min-w-10",
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);