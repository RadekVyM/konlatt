import { useEffect, useState } from "react";
import { DialogState } from "../../types/DialogState";
import FilterDialog from "./FilterDialog";
import ListFilter from "./ListFilter";

export default function ContextItemsFilterDialog(props: {
    state: DialogState,
    items: ReadonlyArray<string>,
    selectedItems: ReadonlyArray<number>,
    searchFilterItemsPlaceholder: string,
    onApply: (selectedItems: ReadonlyArray<number>) => void,
}) {
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set(props.selectedItems));

    useEffect(() => {
        if (props.state.isOpen) {
            setSelectedItems(new Set(props.selectedItems));
        }
    }, [props.state.isOpen, props.selectedItems]);

    return (
        <FilterDialog
            state={props.state}
            onApplyClick={() => props.onApply([...selectedItems])}
            onClearClick={() => setSelectedItems(new Set())}
            clearDisabled={selectedItems.size === 0}>
            <ListFilter
                searchPlaceholder={props.searchFilterItemsPlaceholder}
                items={props.items.map((title, index) => ({ index, title }))}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems} />
        </FilterDialog>
    );
}