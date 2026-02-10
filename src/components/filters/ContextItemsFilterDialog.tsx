import { DialogState } from "../../types/DialogState";
import FilterDialog from "./FilterDialog";
import ListFilter from "./ListFilter";
import { areArraySetEqual } from "../../utils/set";
import StrictCheckBox from "./StrictCheckBox";
import useSetupState from "../../hooks/useSetupState";

export default function ContextItemsFilterDialog(props: {
    state: DialogState,
    items: ReadonlyArray<string>,
    strictSelectedItems: boolean,
    selectedItems: ReadonlyArray<number>,
    searchFilterItemsPlaceholder: string,
    onApply: (selectedItems: ReadonlyArray<number>, strictSelectedItems: boolean) => void,
}) {
    const [strictSelectedItems, setStrictSelectedItems] = useSetupState(props.strictSelectedItems, props.state.isOpen);
    const [selectedItems, setSelectedItems] = useSetupState<Set<number>>(() => new Set(props.selectedItems), props.state.isOpen);

    const filtersChanged = !areArraySetEqual(props.selectedItems, selectedItems) ||
        strictSelectedItems !== props.strictSelectedItems;

    return (
        <FilterDialog
            state={props.state}
            onApplyClick={() => props.onApply([...selectedItems], strictSelectedItems)}
            onClearClick={() => setSelectedItems(new Set())}
            applyDisabled={!filtersChanged}
            clearDisabled={selectedItems.size === 0}>
            <ListFilter
                searchPlaceholder={props.searchFilterItemsPlaceholder}
                items={props.items.map((title, index) => ({ index, title }))}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                header={
                    <StrictCheckBox
                        checked={strictSelectedItems}
                        onChange={setStrictSelectedItems} />} />
        </FilterDialog>
    );
}