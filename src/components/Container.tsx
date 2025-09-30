import { cn } from "../utils/tailwind";

export default function Container(props: {
    as?: "div" | "section" | "li" | "article",
    children?: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    onPointerDown?: React.PointerEventHandler<HTMLElement>,
    onPointerUp?: React.PointerEventHandler<HTMLElement>,
    onPointerMove?: React.PointerEventHandler<HTMLElement>,
    onPointerEnter?: React.PointerEventHandler<HTMLElement>,
    onPointerLeave?: React.PointerEventHandler<HTMLElement>,
}) {
    const As = props.as || "div";

    return (
        <As
            {...props}
            className={cn(
                "bg-surface-container text-on-surface-container shadow border border-outline-variant rounded-lg",
                props.className)}
            style={props.style} />
    );
}