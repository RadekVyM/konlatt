import { FormalContext, getAttributeObjects } from "../../types/FormalContext";
import ItemsCardContent from "./ItemsCardContent";
import ItemCardContent from "./ItemCardContent";
import { ContextCompleteItem, ContextItem } from "./types";
import { cn } from "../../utils/tailwind";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import useContextStore from "../../stores/useContextStore";
import ExportAttributesButton from "../export/ExportAttributesButton";
import ExportAttributeButton from "../export/ExportAttributeButton";
import { CardContainer } from "../layouts/CardContainer";

export type ContextAttributeItem = ContextItem

export default function AttributesList(props: {
    className?: string,
    route: string,
}) {
    const context = useDataStructuresStore((state) => state.context);
    const selectedAttributeIndex = useContextStore((state) => state.selectedAttribute);
    const setSelectedAttributeIndex = useContextStore((state) => state.setSelectedAttribute);
    const filteredAttributes = useContextStore((state) => state.filteredAttributes);
    const attributesSortType = useContextStore((state) => state.attributesSortType);
    const setAttributesSortType = useContextStore((state) => state.setAttributesSortType);
    const attributesSortDirection = useContextStore((state) => state.attributesSortDirection);
    const setAttributesSortDirection = useContextStore((state) => state.setAttributesSortDirection);
    const searchTerms = useContextStore((state) => state.attributesSearchTerms);
    const debouncedSearchInput = useContextStore((state) => state.debouncedAttributesSearchInput);
    const updateSearchInput = useContextStore((state) => state.setDebouncedAttributesSearchInput);
    const strictSelectedFilterObjects = useContextStore((state) => state.strictSelectedFilterObjects);
    const selectedFilterObjects = useContextStore((state) => state.selectedFilterObjects);
    const setSelectedFilterObjects = useContextStore((state) => state.setSelectedFilterObjects);
    const attributes = (context?.attributes || []).map<ContextAttributeItem>((title, index) => ({ index, title }));
    const selectedAttribute = context && selectedAttributeIndex !== null ?
        getContextAttribute(context, selectedAttributeIndex) :
        null;

    return (
        <CardContainer
            className={props.className}>
            <ItemsCardContent<ContextItem>
                id="attributes-list"
                className={cn(selectedAttribute && "hidden")}
                items={attributes}
                filteredItemIndexes={filteredAttributes}
                title="Attributes"
                exportButton={
                    <ExportAttributesButton
                        className="mr-4"
                        route={`${props.route}/attributes/export`} />}
                count={context?.attributes.length || 0}
                searchInputPlaceholder="Search attributes..."
                searchFilterItemsPlaceholder="Search objects..."
                filterTitle="Filter attributes"
                sortTitle="Sort attributes"
                itemContent={(item: ContextAttributeItem, regex) =>
                    <HighlightedSearchTerms
                        text={item.title}
                        regex={regex} />}
                itemKey={(item: ContextAttributeItem) => item.index}
                setSelectedItem={(item: ContextAttributeItem) => setSelectedAttributeIndex(item.index)}
                disabled={context === null}
                searchTerms={searchTerms}
                storedSearchInput={debouncedSearchInput}
                updateSearchInput={updateSearchInput}
                sortType={attributesSortType}
                onSortTypeChange={setAttributesSortType}
                sortDirection={attributesSortDirection} 
                onSortDirectionChange={setAttributesSortDirection}
                filterItems={context?.objects || []}
                strictSelectedFilterItems={strictSelectedFilterObjects}
                selectedFilterItems={selectedFilterObjects}
                onSelectedFilterItemsChange={setSelectedFilterObjects} />
            {selectedAttribute &&
                <ItemCardContent
                    item={selectedAttribute}
                    exportButton={
                        <ExportAttributeButton
                            route={`${props.route}/attribute/${selectedAttribute.index}/export`} />}
                    backButtonContent="All attributes"
                    itemsHeading={`${selectedAttribute.items.length} object${selectedAttribute.items.length === 1 ? "" : "s"}`}
                    onBackClick={() => setSelectedAttributeIndex(null)} />}
        </CardContainer>
    );
}

function getContextAttribute(context: FormalContext, attributeIndex: number): ContextCompleteItem {
    if (attributeIndex >= context.attributes.length) {
        throw new Error("Attribute index is out of range");
    }

    const title = context.attributes[attributeIndex];
    const objects: Array<ContextItem> = getAttributeObjects(context, attributeIndex).map((object) => ({
        index: object,
                title: context.objects[object],
    }));

    return {
        index: attributeIndex,
        title,
        items: objects
    };
}