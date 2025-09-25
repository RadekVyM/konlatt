import { useEffect, useState } from "react";
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
    onApply: (selectedObjects: ReadonlySet<number>, selectedAttributes: ReadonlySet<number>) => void,
}) {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>("objects");
    const [selectedObjects, setSelectedObjects] = useState<Set<number>>(new Set(props.selectedObjects));
    const [selectedAttributes, setSelectedAttributes] = useState<Set<number>>(new Set(props.selectedAttributes));
    const context = useDataStructuresStore((state) => state.context);
    const objects = context?.objects.map((title, index) => ({ index, title, })) || [];
    const attributes = context?.attributes.map((title, index) => ({ index, title, })) || [];
    const selectableObjects = context ? getSelectableItems(context, getAttributeObjects, selectedAttributes) : null;
    const selectableAttributes = context ? getSelectableItems(context, getObjectAttributes, selectedObjects) : null;

    useEffect(() => {
        if (props.state.isOpen) {
            setSelectedObjects(new Set(props.selectedObjects));
        }
    }, [props.state.isOpen, props.selectedObjects]);

    useEffect(() => {
        if (props.state.isOpen) {
            setSelectedAttributes(new Set(props.selectedAttributes));
        }
    }, [props.state.isOpen, props.selectedAttributes]);

    return (
        <FilterDialog
            state={props.state}
            onApplyClick={() => props.onApply(selectedObjects, selectedAttributes)}
            onClearClick={() => {
                setSelectedObjects(new Set());
                setSelectedAttributes(new Set());
            }}
            clearDisabled={selectedObjects.size === 0 && selectedAttributes.size === 0}>
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
                <RangeFilter />}
            {selectedFilter === "attributes-count" &&
                <RangeFilter />}
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