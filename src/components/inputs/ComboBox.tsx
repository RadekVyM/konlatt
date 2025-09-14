import { useRef } from "react";
import { cn } from "../../utils/tailwind";
import Button from "../inputs/Button";
import { usePopover } from "../../hooks/usePopover";
import { LuChevronDown } from "react-icons/lu";

type ComboBoxItem<KeyT> = {
    key: KeyT,
    label: string
}

/** Component for selecting single item from a collection of items which are displayed in a dropdown. */
export default function ComboBox<KeyT extends string>(props: {
    id: string,
    items: Array<ComboBoxItem<KeyT>>,
    className?: string,
    selectedKey: KeyT,
    disabled?: boolean,
    onKeySelectionChange: (key: KeyT) => void,
}) {
    const divRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [isOpen, togglePopover, closePopover, showPopover] = usePopover(divRef);
    const id = `${props.id}-combobox`;

    function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
        if (props.disabled) {
            return;
        }

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            showPopover();
            const radio = listRef.current?.querySelector("input:checked") as (HTMLInputElement | null);
            setTimeout(() => radio?.focus(), 1);
        }
    }

    return (
        <div
            ref={divRef}
            className={cn("relative select-none", props.className)}
            onKeyDownCapture={(e) => {
                if (props.disabled) {
                    return;
                }

                if (e.key === "Escape" && isOpen) {
                    e.preventDefault();
                    e.stopPropagation();
                    closePopover();
                }
            }}>
            <Button
                className="w-full h-full flex justify-start"
                variant="container"
                role="combobox"
                aria-labelledby={`${id}-label`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={togglePopover}
                onKeyDown={onButtonKeyDown}
                disabled={props.disabled}>
                <span
                    id={`${id}-label`}
                    className="flex-1 text-start">
                    {props.items.find((item) => item.key === props.selectedKey)?.label}
                </span>
                <LuChevronDown
                    className={cn("transition-transform", isOpen && "rotate-180 translate-y-[-1px]")} />
            </Button>
            <ul
                ref={listRef}
                role="listbox"
                id={id}
                className={cn(
                    "absolute w-full left-0 right-0 z-50 mt-1 max-h-56 flex flex-col p-1.5 gap-y-1",
                    "overflow-y-auto thin-scrollbar",
                    "rounded-md disabled:opacity-50 disabled:pointer-events-none",
                    "bg-surface-container text-on-surface-container border border-outline-variant shadow-lg",
                    "slide-down-popover-transition",
                    isOpen ? "open" : "hidden")}>
                {props.items.map((item) =>
                    <li
                        key={item.key}
                        role="option"
                        aria-selected={props.selectedKey === item.key}
                        className={cn(
                            props.selectedKey === item.key ? "bg-surface-dim-container text-on-surface-dim-container" : "",
                            "flex rounded-md transition-colors",
                            "focus-within:outline-2",
                            "focus-within:bg-surface-dim-container focus-within:text-on-surface-dim-container",
                            "hover:bg-surface-light-dim-container hover:text-on-surface-dim-container")}
                        onPointerDown={() => {
                            if (props.disabled) {
                                return;
                            }

                            props.onKeySelectionChange(item.key);
                            closePopover();
                        }}
                        onKeyUp={(e) => {
                            if (props.disabled) {
                                return;
                            }

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
                            onChange={(e) => {
                                if (props.disabled) {
                                    return;
                                }

                                props.onKeySelectionChange(e.currentTarget.value as KeyT);
                            }}
                            disabled={props.disabled} />
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