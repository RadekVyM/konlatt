import { cn } from "../../utils/tailwind";

/**
 * Title component for cards.
 */
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
