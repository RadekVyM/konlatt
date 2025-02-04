import { cn } from "../utils/tailwind";

export default function SearchInput(props: {
    className?: string,
    placeholder: string,
    value: string,
    onChange: (value: string) => void,
}) {
    return (
        <input
            type="text"
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            className={cn("text-sm bg-surface-light-dim-container hover:bg-surface-dim-container px-2 py-1 rounded-md", props.className)} />
    );
}