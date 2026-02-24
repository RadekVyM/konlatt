import { cn } from "../utils/tailwind";

/**
 * Fallback component that displays a "Nothing found" message.
*/
export default function NothingFound(props: {
    className?: string,
}) {
    return (
        <div
            className={cn("grid place-content-center text-sm text-on-surface-container-muted", props.className)}>
            Nothing found
        </div>
    );
}