import { cn } from "../utils/tailwind";

/**
 * Displays a formatted count of found items relative to a total.
*/
export default function Found(props: {
    className?: string,
    found: number,
    total: number,
}) {
    return (
        <span
            className={cn("text-xs text-on-surface-container-muted", props.className)}>
            Found: {props.found}{props.found !== props.total ? `/${props.total}` : ""}
        </span>
    )
}