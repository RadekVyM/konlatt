import { LuArrowDownUp, LuDot, LuFilter } from "react-icons/lu";
import Button from "../inputs/Button";
import DropDownMenu, { DropDownMenuItem, useDropDownMenuContext } from "../inputs/DropDownMenu";

type SortDirection = "asc" | "desc"

export default function FilterSortBar<TSortType extends string>(props: {
    filterTitle?: string,
    sortTitle?: string,
    disabled?: boolean,
    justify?: "stretch" | "left" | "right",
    id: string,
    sortItems: Array<DropDownMenuItem<TSortType>>,
    sortType: TSortType,
    sortDirection: SortDirection,
    withFilterIndicator?: boolean,
    onFilterClick: () => void,
    onSortTypeChange: (key: TSortType) => void,
    onSortDirectionChange: (key: SortDirection) => void,
}) {
    return (
        <div
            className="flex gap-1.5">
            <Button
                className="relative"
                title={props.filterTitle || "Filter"}
                variant="icon-secondary"
                size="sm"
                disabled={props.disabled}
                onClick={props.onFilterClick}>
                <LuFilter />

                {props.withFilterIndicator &&
                    <LuDot
                        className="absolute -top-5 -right-5 text-primary w-10 h-10 aspect-square rounded-full pointer-events-none" />}
            </Button>
            <SortButton<TSortType>
                sortTitle={props.sortTitle}
                disabled={props.disabled}
                id={`${props.id}-sort`}
                justify={props.justify}
                items={props.sortItems}
                sortType={props.sortType}
                sortDirection={props.sortDirection}
                onSortTypeChange={props.onSortTypeChange}
                onSortDirectionChange={props.onSortDirectionChange} />
        </div>
    );
}

function SortButton<TSortType extends string>(props: {
    sortTitle?: string,
    disabled?: boolean,
    id: string,
    items: Array<DropDownMenuItem<TSortType>>,
    justify?: "stretch" | "left" | "right",
    sortType: TSortType,
    sortDirection: SortDirection,
    onSortTypeChange: (key: TSortType) => void,
    onSortDirectionChange: (key: SortDirection) => void,
}) {
    return (
        <DropDownMenu<TSortType | SortDirection>
            id={props.id}
            disabled={props.disabled}
            justify={props.justify}
            size="sm"
            groups={[
                {
                    id: "sort",
                    items: props.items,
                    selectedKey: props.sortType,
                    onKeySelectionChange: (key) => props.onSortTypeChange(key as TSortType),
                },
                {
                    id: "direction",
                    items: [
                        {
                            key: "asc",
                            label: "Ascending",
                        },
                        {
                            key: "desc",
                            label: "Descending",
                        },
                    ],
                    selectedKey: props.sortDirection,
                    onKeySelectionChange: (key) => props.onSortDirectionChange(key as SortDirection),
                },
            ]}>
            <SortToggleButton
                {...props} />
        </DropDownMenu>
    );
}

function SortToggleButton(props: {
    sortTitle?: string,
    disabled?: boolean,
}) {
    const {
        id,
        isOpen,
        onButtonKeyDown,
        togglePopover,
    } = useDropDownMenuContext();

    return (
        <Button
            title={props.sortTitle || "Sort"}
            variant="icon-secondary"
            size="sm"
            role="combobox"
            aria-labelledby={`${id}-label`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={id}
            onClick={togglePopover}
            onKeyDown={onButtonKeyDown}
            disabled={props.disabled}>
            <LuArrowDownUp />
        </Button>
    );
}