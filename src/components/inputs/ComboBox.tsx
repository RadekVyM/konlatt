import { cn } from "../../utils/tailwind";
import Button from "../inputs/Button";
import { LuChevronDown } from "react-icons/lu";
import DropDownMenu, { DropDownMenuItem, useDropDownMenuContext } from "./DropDownMenu";

/** Component for selecting single item from a collection of items which are displayed in a dropdown. */
export default function ComboBox<TKey extends string>(props: {
    id: string,
    className?: string,
    disabled?: boolean,
    items: Array<DropDownMenuItem<TKey>>,
    selectedKey: TKey,
    onKeySelectionChange: (key: TKey) => void,
}) {
    return (
        <DropDownMenu<TKey>
            groups={[
                {
                    id: props.id,
                    items: props.items,
                    selectedKey: props.selectedKey,
                    onKeySelectionChange: props.onKeySelectionChange,
                }
            ]}
            {...props}>
            <ToggleButton
                disabled={props.disabled} />
        </DropDownMenu>
    );
}

function ToggleButton(props: {
    disabled?: boolean,
}) {
    const {
        id,
        isOpen,
        onButtonKeyDown,
        togglePopover,
        selectedItemLabels,
    } = useDropDownMenuContext();

    return (
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
                className="flex-1 text-start line-clamp-1">
                {selectedItemLabels[0]}
            </span>
            <LuChevronDown
                className={cn("transition-transform", isOpen && "rotate-180 translate-y-[-1px]")} />
        </Button>
    );
}