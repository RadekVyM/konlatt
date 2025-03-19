import { cn } from "../utils/tailwind";

export default function Container(props: {
    as?: "div" | "section" | "li",
    children?: React.ReactNode,
    className?: string,
    style?: React.CSSProperties
}) {
    const As = props.as || "div";

    return (
        <As
            className={cn(
                "bg-surface-container text-on-surface-container shadow border border-outline-variant rounded-lg",
                props.className)}
            style={props.style}>
            {props.children}
        </As>
    );
}