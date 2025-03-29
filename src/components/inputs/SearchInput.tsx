import { LuCircleX } from "react-icons/lu";
import { cn } from "../../utils/tailwind";

export default function SearchInput(props: {
    className?: string,
    inputClassName?: string,
    placeholder: string,
    value: string,
    onChange: (value: string) => void,
}) {
    const cancelButtonVisible = props.value.length > 0;

    return (
        <div
            className={cn("relative text-on-surface-container", props.className)}>
            <input
                type="text"
                size={1}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                placeholder={props.placeholder}
                className={cn("text-sm bg-surface-light-dim-container hover:bg-surface-dim-container px-2 pr-7 py-1.5 rounded-md w-full h-full",  props.inputClassName)} />
            
            {cancelButtonVisible &&
                <button
                    className="absolute right-0 mr-2 top-1/2 -translate-y-[50%] cursor-pointer"
                    title="Clear"
                    onClick={() => props.onChange("")}>
                    <LuCircleX className="w-4 h-4" />
                </button>}
        </div>
    );
}