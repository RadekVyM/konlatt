import { cn } from "../../utils/tailwind";

export default function CardSectionTitle(props: {
    children: React.ReactNode,
    className?: string,
}) {
    return (
        <h2
            className={cn("text-lg font-semibold", props.className)}>
            {props.children}
        </h2>
    );
}
