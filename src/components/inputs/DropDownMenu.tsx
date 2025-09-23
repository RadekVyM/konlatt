import { createContext, useContext, useRef } from "react";
import { cn } from "../../utils/tailwind";
import { usePopover } from "../../hooks/usePopover";
import useOnClickOutside from "../../hooks/useOnClickOutside";

export type DropDownMenuItem<KeyT> = {
    key: KeyT,
    label: string
}

export type DropDownMenuGroup<KeyT extends string> = {
    id: string,
    items: Array<DropDownMenuItem<KeyT>>,
    selectedKey: KeyT,
    onKeySelectionChange: (key: KeyT) => void,
}

type DropDownMenuContextType = {
    id: string,
    isOpen: boolean,
    selectedItemLabels: Array<string>,
    togglePopover: () => void,
    onButtonKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void,
}

const DropDownMenuContext = createContext<DropDownMenuContextType | null>(null);

/** Component for selecting single item from a collection of items which are displayed in a dropdown. */
export default function DropDownMenu<KeyT extends string>(props: {
    id: string,
    className?: string,
    disabled?: boolean,
    children?: React.ReactNode,
    justify?: "stretch" | "left" | "right",
    size?: "default" | "sm",
    groups: Array<DropDownMenuGroup<KeyT>>,
}) {
    const divRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [isOpen, togglePopover, closePopover, showPopover] = usePopover(divRef);
    const id = `${props.id}-combobox`;
    const justify = props.justify || "stretch";
    const size = props.size || "default";

    useOnClickOutside(divRef, () => closePopover());

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
        <DropDownMenuContext.Provider
            value={{
                id,
                isOpen,
                selectedItemLabels: getSelectedItemLabels(props.groups),
                togglePopover,
                onButtonKeyDown,
            }}>
            <div
                ref={divRef}
                className={cn("relative select-none", props.className)}>
                {props.children}
                <div
                    ref={listRef}
                    role="listbox"
                    id={id}
                    className={cn(
                        "absolute z-50 mt-1 max-h-56 p-1.5 flex flex-col gap-y-1.5",
                        "overflow-y-auto thin-scrollbar",
                        "rounded-md disabled:opacity-50 disabled:pointer-events-none",
                        "bg-surface-container text-on-surface-container border border-outline-variant shadow-lg",
                        "slide-down-popover-transition",
                        size === "sm" && "text-sm",
                        justify === "stretch" && "w-full",
                        (justify === "stretch" || justify === "left") && "left-0",
                        (justify === "stretch" || justify === "right") && "right-0",
                        isOpen ? "open" : "hidden")}>
                    {props.groups.map((group, groupIndex) =>
                        <ul
                            key={group.id}
                            className={cn(
                                "flex flex-col gap-y-1",
                                groupIndex !== props.groups.length - 1 && "border-b border-outline-variant pb-1.5")}>
                            {group.items.map((item) =>
                            <li
                                key={item.key}
                                role="option"
                                aria-selected={group.selectedKey === item.key}
                                className={cn(
                                    group.selectedKey === item.key ? "bg-surface-dim-container text-on-surface-dim-container" : "",
                                    "flex rounded-md transition-colors",
                                    "focus-within:outline-2",
                                    "focus-within:bg-surface-dim-container focus-within:text-on-surface-dim-container",
                                    "hover:bg-surface-light-dim-container hover:text-on-surface-dim-container")}
                                onPointerDown={() => {
                                    if (props.disabled) {
                                        return;
                                    }

                                    group.onKeySelectionChange(item.key);
                                    closePopover();
                                }}
                                onKeyUp={(e) => {
                                    if (props.disabled) {
                                        return;
                                    }

                                    if (e.key === "Enter") {
                                        group.onKeySelectionChange(item.key);
                                        closePopover();
                                    }
                                }}>
                                <input
                                    className="sr-only"
                                    type="radio"
                                    name={group.id}
                                    id={`${id}-${item.key}`}
                                    value={item.key}
                                    checked={group.selectedKey === item.key}
                                    onChange={() => {
                                        if (props.disabled) {
                                            return;
                                        }

                                        //props.onKeySelectionChange(e.currentTarget.value as KeyT);
                                    }}
                                    disabled={props.disabled} />
                                <label
                                    className="flex-1 py-0.5 px-2 cursor-pointer w-max"
                                    htmlFor={`${id}-${item.key}`}>
                                    {item.label}
                                </label>
                            </li>)}
                        </ul>)}
                </div>
            </div>
        </DropDownMenuContext.Provider>
    )
}

export function useDropDownMenuContext() {
    const context = useContext(DropDownMenuContext);
    if (!context) {
        throw new Error("DropDownMenuContext is missing");
    }
    return context as DropDownMenuContextType;
}

function getSelectedItemLabels<KeyT extends string>(groups: Array<DropDownMenuGroup<KeyT>>) {
    const labels = new Array<string>();

    for (const group of groups) {
        const label = group.items.find((it) => it.key === group.selectedKey)?.label;

        if (label) {
            labels.push(label);
        }
    }

    return labels;
}