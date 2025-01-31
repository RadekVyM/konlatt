import { cn } from "../utils/tailwind";

export default function Container(props: {
    as?: "div" | "section",
    children?: React.ReactNode,
    className?: string
}) {
    const As = props.as || "div";

    return (
        <As
            className={cn(
                "bg-surface-container text-on-surface-container shadow rounded-md",
                props.className)}>
            {props.children}
        </As>
    );
}