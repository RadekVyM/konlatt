import { useRef } from "react";
import { cn } from "../../utils/tailwind";
import Button from "../inputs/Button";
import { usePopover } from "../../hooks/usePopover";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

type ComboBoxItem = {
    key: string,
    label: string
}

/** Component for selecting single item from a collection of items which are displayed in a dropdown. */
export default function ComboBox(props: {
    id: string,
    items: Array<ComboBoxItem>,
    className?: string,
    selectedKey: string,
    onKeySelectionChange: (key: string) => void,
}) {
    const divRef = useRef<HTMLDivElement>(null);
    const [isOpen, togglePopover, closePopover] = usePopover(divRef);
    const id = `${props.id}-combobox`;

    return (
        <div
            ref={divRef}
            className={cn("relative", props.className)}>
            <Button
                className="w-full h-full flex justify-start"
                variant="container"
                role="combobox"
                aria-labelledby={`${id}-label`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={togglePopover}>
                <span id={`${id}-label`} className="flex-1 text-start">{props.items.find((item) => item.key === props.selectedKey)?.label}</span>
                {
                    isOpen ?
                        <LuChevronUp /> :
                        <LuChevronDown />
                }
            </Button>
            <ul
                role="listbox"
                id={id}
                className={cn(
                    "absolute w-full left-0 right-0 z-50 mt-1 max-h-56 flex flex-col p-1.5 gap-y-1",
                    "overflow-y-auto thin-scrollbar",
                    "rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none",
                    "bg-surface-container text-on-surface-container border border-outline-variant shadow-lg",
                    isOpen ? "" : "invisible")}>
                {props.items.map((item) =>
                    <li
                        key={item.key}
                        role="option"
                        aria-selected={props.selectedKey === item.key}
                        className={cn(
                            props.selectedKey === item.key ? "bg-surface-dim-container text-on-surface-dim-container" : "",
                            "flex rounded-md",
                            "focus-within:outline-2",
                            "focus-within:bg-surface-dim-container focus-within:text-on-surface-dim-container",
                            "hover:bg-surface-light-dim-container hover:text-on-surface-dim-container")}
                        onPointerDown={() => {
                            props.onKeySelectionChange(item.key);
                        }}
                        onKeyUp={(e) => {
                            if (e.key === "Enter") {
                                closePopover();
                            }
                        }}>
                        <input
                            className="sr-only"
                            type="radio"
                            id={`${id}-${item.key}`}
                            value={item.key}
                            checked={props.selectedKey === item.key}
                            onChange={(e) => props.onKeySelectionChange(e.currentTarget.value)} />
                        <label
                            className="flex-1 py-0.5 px-2 cursor-pointer"
                            htmlFor={`${id}-${item.key}`}>
                            {item.label}
                        </label>
                    </li>)}
            </ul>
        </div>
    )
}