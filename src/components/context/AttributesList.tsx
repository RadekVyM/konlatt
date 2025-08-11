import { FormalContext, getAttributeObjects } from "../../types/FormalContext";
import { CardContainer } from "../CardContainer";
import ItemsCardContent from "./ItemsCardContent";
import ItemCardContent from "./ItemCardContent";
import { ContextCompleteItem, ContextItem } from "./types";
import { cn } from "../../utils/tailwind";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import useContextStore from "../../stores/useContextStore";
import ExportAttributesButton from "../export/ExportAttributesButton";
import ExportAttributeButton from "../export/ExportAttributeButton";

export type ContextAttributeItem = ContextItem

export default function AttributesList(props: {
    className?: string,
    route: string,
}) {
    const context = useDataStructuresStore((state) => state.context);
    const selectedAttributeIndex = useContextStore((state) => state.selectedAttribute);
    const setSelectedAttributeIndex = useContextStore((state) => state.setSelectedAttribute);
    const attributes = (context?.attributes || []).map<ContextAttributeItem>((title, index) => ({ index, title }));
    const selectedAttribute = context && selectedAttributeIndex !== null ?
        getContextAttribute(context, selectedAttributeIndex) :
        null;

    return (
        <CardContainer
            className={props.className}>
            <ItemsCardContent
                className={cn(selectedAttribute && "hidden")}
                items={attributes}
                title="Attributes"
                exportButton={
                    <ExportAttributesButton
                        className="mr-4"
                        route={`${props.route}/attributes/export`} />}
                count={context?.attributes.length || 0}
                searchInputPlaceholder="Search attributes..."
                filterTitle="Filter attributes"
                sortTitle="Sort attributes"
                itemContent={(item: ContextAttributeItem, regex) =>
                    <HighlightedSearchTerms
                        text={item.title}
                        regex={regex} />}
                itemKey={(item: ContextAttributeItem) => item.index}
                setSelectedItem={(item: ContextAttributeItem) => setSelectedAttributeIndex(item.index)}
                disabled={context === null} />
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