import { cn } from "../../utils/tailwind";

export default function RangeFilter(props: {
    className?: string,
}) {
    return (
        <div
            className={cn("flex-1 px-2 py-1 max-h-full", props.className)}>

        </div>
    );
}