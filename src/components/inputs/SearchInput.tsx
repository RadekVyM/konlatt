import { LuCircleX } from "react-icons/lu";
import { cn } from "../../utils/tailwind";
import Button from "./Button";
import Input from "./Input";

export default function SearchInput(props: {
    className?: string,
    inputClassName?: string,
    placeholder: string,
    value: string,
    disabled?: boolean,
    onChange: (value: string) => void,
}) {
    const cancelButtonVisible = props.value.length > 0;

    return (
        <div
            className={cn("relative text-on-surface-container", props.className)}>
            <Input
                type="text"
                size={1}
                disabled={props.disabled}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                placeholder={props.placeholder}
                className={cn(
                    "pr-7 w-full h-full",
                    props.inputClassName)} />

            {cancelButtonVisible &&
                <Button
                    className="absolute right-0 top-1/2 -translate-y-[50%]"
                    variant="plain"
                    title="Clear"
                    disabled={props.disabled}
                    onClick={() => props.onChange("")}>
                    <LuCircleX className="w-4 h-4" />
                </Button>}
        </div>
    );
}