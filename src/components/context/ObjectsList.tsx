import { FormalContext, getObjectAttributes } from "../../types/FormalContext";
import { CardContainer } from "../CardContainer";
import ItemsCardContent from "./ItemsCardContent";
import ItemCardContent from "./ItemCardContent";
import { ContextCompleteItem, ContextItem } from "./types";
import { cn } from "../../utils/tailwind";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import useContextStore from "../../stores/useContextStore";
import ExportObjectsButton from "../export/ExportObjectsButton";
import ExportObjectButton from "../export/ExportObjectButton";

type ContextObjectItem = ContextItem

export default function ObjectsList(props: {
    className?: string,
    route: string,
}) {
    const context = useDataStructuresStore((state) => state.context);
    const selectedObjectIndex = useContextStore((state) => state.selectedObject);
    const setSelectedObjectIndex = useContextStore((state) => state.setSelectedObject);
    const filteredObjects = useContextStore((state) => state.filteredObjects);
    const objectsSortType = useContextStore((state) => state.objectsSortType);
    const setObjectsSortType = useContextStore((state) => state.setObjectsSortType);
    const objectsSortDirection = useContextStore((state) => state.objectsSortDirection);
    const setObjectsSortDirection = useContextStore((state) => state.setObjectsSortDirection);
    const searchTerms = useContextStore((state) => state.objectsSearchTerms);
    const debouncedSearchInput = useContextStore((state) => state.debouncedObjectsSearchInput);
    const updateSearchInput = useContextStore((state) => state.setDebouncedObjectsSearchInput);
    const strictSelectedFilterAttributes = useContextStore((state) => state.strictSelectedFilterAttributes);
    const selectedFilterAttributes = useContextStore((state) => state.selectedFilterAttributes);
    const setSelectedFilterAttributes = useContextStore((state) => state.setSelectedFilterAttributes);
    const objects = (context?.objects || []).map<ContextObjectItem>((title, index) => ({ index, title }));
    const selectedObject = context && selectedObjectIndex !== null ?
        getContextObject(context, selectedObjectIndex) :
        null;

    return (
        <CardContainer
            className={props.className}>
            <ItemsCardContent<ContextItem>
                id="objects-list"
                className={cn(selectedObject && "hidden")}
                items={objects}
                filteredItemIndexes={filteredObjects}
                title="Objects"
                exportButton={
                    <ExportObjectsButton
                        className="mr-4"
                        route={`${props.route}/objects/export`} />}
                count={context?.objects.length || 0}
                searchInputPlaceholder="Search objects..."
                searchFilterItemsPlaceholder="Search attributes..."
                filterTitle="Filter objects"
                sortTitle="Sort objects"
                itemContent={(item: ContextObjectItem, regex) =>
                    <HighlightedSearchTerms
                        text={item.title}
                        regex={regex} />}
                itemKey={(item: ContextObjectItem) => item.index}
                setSelectedItem={(item: ContextObjectItem) => setSelectedObjectIndex(item.index)}
                disabled={context === null}
                searchTerms={searchTerms}
                storedSearchInput={debouncedSearchInput}
                updateSearchInput={updateSearchInput}
                sortType={objectsSortType}
                onSortTypeChange={setObjectsSortType}
                sortDirection={objectsSortDirection}
                onSortDirectionChange={setObjectsSortDirection}
                filterItems={context?.attributes || []}
                strictSelectedFilterItems={strictSelectedFilterAttributes}
                selectedFilterItems={selectedFilterAttributes}
                onSelectedFilterItemsChange={setSelectedFilterAttributes} />
            {selectedObject &&
                <ItemCardContent
                    item={selectedObject}
                    exportButton={
                        <ExportObjectButton
                            route={`${props.route}/object/${selectedObject.index}/export`} />}
                    backButtonContent="All objects"
                    itemsHeading={`${selectedObject.items.length} attribute${selectedObject.items.length === 1 ? "" : "s"}`}
                    onBackClick={() => setSelectedObjectIndex(null)} />}
        </CardContainer>
    );
}

function getContextObject(context: FormalContext, objectIndex: number): ContextCompleteItem {
    if (objectIndex >= context.objects.length) {
        throw new Error("Object index is out of range");
    }

    const title = context.objects[objectIndex];
    const attributes: Array<ContextItem> = getObjectAttributes(context, objectIndex).map((attribute) => ({
        index: attribute,
        title: context.attributes[attribute],
    }));

    return {
        index: objectIndex,
        title,
        items: attributes
    };
}