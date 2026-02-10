import { LuBan, LuCheck, LuListChecks, LuTrash } from "react-icons/lu";
import { DialogState } from "../../../types/DialogState";
import ContentDialog from "../../ContentDialog";
import Button from "../../inputs/Button";
import HorizontalScroller from "../../HorizontalScroller";
import { useState } from "react";
import ListFilter from "../../filters/ListFilter";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import useSetupState from "../../../hooks/useSetupState";
import { createRange } from "../../../utils/array";
import { areSetsEqual } from "../../../utils/set";

type Tab = "objects" | "attributes"

const TABS: ReadonlyArray<{ title: string, id: Tab }> = [
    {
        id: "objects",
        title: "Objects",
    },
    {
        id: "attributes",
        title: "Attributes",
    },
];

export default function LabelsSelectionDialog(props: {
    state: DialogState,
    selectedObjectLabels: ReadonlySet<number>,
    selectedAttributeLabels: ReadonlySet<number>,
    onApply: (
        selectedObjects: ReadonlySet<number>,
        selectedAttributes: ReadonlySet<number>,
    ) => void,
}) {
    const [selectedTab, setSelectedTab] = useState<Tab>("objects");
    const context = useDataStructuresStore((state) => state.context);
    const objects = context?.objects.map((title, index) => ({ index, title, })) || [];
    const attributes = context?.attributes.map((title, index) => ({ index, title, })) || [];
    const [selectedObjects, setSelectedObjects] = useSetupState<Set<number>>(() => new Set(props.selectedObjectLabels), props.state.isOpen);
    const [selectedAttributes, setSelectedAttributes] = useSetupState<Set<number>>(() => new Set(props.selectedAttributeLabels), props.state.isOpen);

    const allObjectsSelected = objects?.length === selectedObjects.size;
    const allAttributesSelected = attributes?.length === selectedAttributes.size;
    const selectionChanged = !areSetsEqual(props.selectedAttributeLabels, selectedAttributes) ||
        !areSetsEqual(props.selectedObjectLabels, selectedObjects);

    return (
        <ContentDialog
            className="max-w-xl max-h-[30rem] h-full overflow-hidden px-0"
            headerClassName="px-5"
            ref={props.state.dialogRef}
            state={props.state}
            heading="Shown labels">
            <HorizontalScroller
                className="mb-3 mx-5">
                {TABS.map((tab) =>
                    <Button
                        key={tab.id}
                        size="sm"
                        className="w-fit text-nowrap"
                        variant={selectedTab === tab.id ? "primary" : "default"}
                        onClick={() => setSelectedTab(tab.id)}>
                        {tab.title}
                    </Button>)}
            </HorizontalScroller>

            {selectedTab === "objects" &&
                <ListFilter
                    searchPlaceholder="Search objects..."
                    items={objects}
                    selectedItems={selectedObjects}
                    setSelectedItems={setSelectedObjects}
                    searchInputTrail={
                        <BatchSelectionButtons
                            onSelectAllClick={() => setSelectedObjects(new Set(createRange(objects.length)))}
                            onDeselectAllClick={() => setSelectedObjects(new Set())} />} />}
            {selectedTab === "attributes" &&
                <ListFilter
                    searchPlaceholder="Search attributes..."
                    items={attributes}
                    selectedItems={selectedAttributes}
                    setSelectedItems={setSelectedAttributes}
                    searchInputTrail={
                        <BatchSelectionButtons
                            onSelectAllClick={() => setSelectedAttributes(new Set(createRange(attributes.length)))}
                            onDeselectAllClick={() => setSelectedAttributes(new Set())} />} />}

            <footer
                className="px-5 pt-3 flex gap-2 justify-between items-center">
                <Button
                    size="sm"
                    disabled={allObjectsSelected && allAttributesSelected}
                    onClick={() => {
                        setSelectedObjects(new Set(createRange(objects.length)));
                        setSelectedAttributes(new Set(createRange(attributes.length)));
                    }}>
                    <LuTrash />
                    Reset to default
                </Button>
                <Button
                    variant="primary"
                    disabled={!selectionChanged}
                    onClick={async () => {
                        await props.state.hide();
                        props.onApply(
                            selectedObjects,
                            selectedAttributes);
                    }}>
                    <LuCheck />
                    Confirm
                </Button>
            </footer>
        </ContentDialog>
    );
}

function BatchSelectionButtons(props: {
    onSelectAllClick: () => void,
    onDeselectAllClick: () => void,
}) {
    return (
        <>
            <Button
                size="sm"
                variant="icon-secondary"
                title="Select all"
                onClick={props.onSelectAllClick}>
                <LuListChecks />
            </Button>
            <Button
                size="sm"
                variant="icon-secondary"
                title="Deselect all"
                onClick={props.onDeselectAllClick}>
                <LuBan />
            </Button>
        </>
    );
}