import { useEffect, useMemo, useState } from "react";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { DialogState } from "../../types/DialogState";
import FilterDialog from "./FilterDialog";
import ListFilter from "./ListFilter";
import HorizontalScroller from "../HorizontalScroller";
import Button from "../inputs/Button";
import RangeFilter from "./RangeFilter";
import { FormalContext, getAttributeObjects, getObjectAttributes } from "../../types/FormalContext";

type FilterType = "objects" | "attributes" | "objects-count" | "attributes-count"

const FILTERS: ReadonlyArray<{ title: string, id: FilterType }> = [
    {
        id: "objects",
        title: "Objects",
    },
    {
        id: "attributes",
        title: "Attributes",
    },
    {
        id: "objects-count",
        title: "Objects count",
    },
    {
        id: "attributes-count",
        title: "Attributes count",
    },
];

export default function ConceptsFilterDialog(props: {
    state: DialogState,
    selectedObjects: ReadonlySet<number>,
    selectedAttributes: ReadonlySet<number>,
    minObjectsCount: number | null,
    maxObjectsCount: number | null,
    minAttributesCount: number | null,
    maxAttributesCount: number | null,
    onApply: (
        selectedObjects: ReadonlySet<number>,
        selectedAttributes: ReadonlySet<number>,
        minObjectsCount: number | null,
        maxObjectsCount: number | null,
        minAttributesCount: number | null,
        maxAttributesCount: number | null,
    ) => void,
}) {
    const context = useDataStructuresStore((state) => state.context);
    const objects = context?.objects.map((title, index) => ({ index, title, })) || [];
    const attributes = context?.attributes.map((title, index) => ({ index, title, })) || [];
    const [selectedFilter, setSelectedFilter] = useState<FilterType>("objects");
    const [minObjectsCount, setMinObjectsCount] = useSetupState(props.minObjectsCount, props.state.isOpen);
    const [maxObjectsCount, setMaxObjectsCount] = useSetupState(props.maxObjectsCount, props.state.isOpen);
    const [minAttributesCount, setMinAttributesCount] = useSetupState(props.minAttributesCount, props.state.isOpen);
    const [maxAttributesCount, setMaxAttributesCount] = useSetupState(props.maxAttributesCount, props.state.isOpen);
    const [selectedObjects, setSelectedObjects] = useSetupState<Set<number>>(new Set(props.selectedObjects), props.state.isOpen);
    const [selectedAttributes, setSelectedAttributes] = useSetupState<Set<number>>(new Set(props.selectedAttributes), props.state.isOpen);
    const selectableObjects = context ? getSelectableItems(context, getAttributeObjects, selectedAttributes) : null;
    const selectableAttributes = context ? getSelectableItems(context, getObjectAttributes, selectedObjects) : null;

    const clearDisabled = selectedObjects.size === 0 &&
        selectedAttributes.size === 0 &&
        minObjectsCount === null &&
        maxObjectsCount === null &&
        minAttributesCount === null &&
        maxAttributesCount === null;

    return (
        <FilterDialog
            state={props.state}
            onApplyClick={() => props.onApply(
                selectedObjects,
                selectedAttributes,
                minObjectsCount === 0 ? null : minObjectsCount,
                maxObjectsCount === objects.length ? null : maxObjectsCount,
                minAttributesCount === 0 ? null : minAttributesCount,
                maxAttributesCount === attributes.length ? null : maxAttributesCount)}
            onClearClick={() => {
                setSelectedObjects(new Set());
                setSelectedAttributes(new Set());
                setMinObjectsCount(null);
                setMaxObjectsCount(null);
                setMinAttributesCount(null);
                setMaxAttributesCount(null);
            }}
            clearDisabled={clearDisabled}>
            <HorizontalScroller
                className="mb-3 mx-5">
                {FILTERS.map((filter) =>
                    <Button
                        key={filter.id}
                        size="sm"
                        className="w-fit text-nowrap"
                        variant={selectedFilter === filter.id ? "primary" : "default"}
                        onClick={() => setSelectedFilter(filter.id)}>
                        {filter.title}
                    </Button>)}
            </HorizontalScroller>

            {selectedFilter === "objects" &&
                <ListFilter
                    searchPlaceholder="Search objects..."
                    items={selectableObjects === null || selectableObjects.size === 0 ?
                        objects :
                        objects.filter((o) => selectableObjects.has(o.index))}
                    selectedItems={selectedObjects}
                    setSelectedItems={setSelectedObjects} />}
            {selectedFilter === "attributes" &&
                <ListFilter
                    searchPlaceholder="Search attributes..."
                    items={selectableAttributes === null || selectableAttributes.size === 0 ?
                        attributes :
                        attributes.filter((a) => selectableAttributes.has(a.index))}
                    selectedItems={selectedAttributes}
                    setSelectedItems={setSelectedAttributes} />}
            {selectedFilter === "objects-count" &&
                <RangeFilter
                    id="objects-count-range"
                    min={minObjectsCount || 0}
                    onMinChange={setMinObjectsCount}
                    max={maxObjectsCount === null ? objects.length : maxObjectsCount}
                    onMaxChange={setMaxObjectsCount}
                    maxCount={objects.length} />}
            {selectedFilter === "attributes-count" &&
                <RangeFilter
                    id="attributes-count-range"
                    min={minAttributesCount || 0}
                    onMinChange={setMinAttributesCount}
                    max={maxAttributesCount === null ? attributes.length : maxAttributesCount}
                    onMaxChange={setMaxAttributesCount}
                    maxCount={attributes.length} />}
        </FilterDialog>
    );
}

function getSelectableItems(
    context: FormalContext,
    contextItems: (context: FormalContext, attribute: number) => Array<number>,
    filterItems: ReadonlySet<number>,
) {
    const selectedItems = new Set<number>();

    for (const item of filterItems) {
        contextItems(context, item).forEach((it) => selectedItems.add(it));
    }

    return selectedItems;
}

function useSetupState<T>(defaultValue: T, isOpen: boolean) {
    const state = useState<T>(defaultValue);
    const memoDefaultValue = useMemo(() => defaultValue, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            state[1](memoDefaultValue);
        }
    }, [isOpen, memoDefaultValue]);

    return state;
}