import useProjectStore from "../../hooks/stores/useProjectStore";
import { formalContextHasAttribute, RawFormalContext } from "../../types/RawFormalContext";
import { CardContainer } from "../CardContainer";
import ItemsCardContent from "./ItemsCardContent";
import ItemCardContent from "./ItemCardContent";
import { ContextCompleteItem, ContextItem } from "./types";
import { searchFilter } from "./utils";
import { cn } from "../../utils/tailwind";
import HighlightedSearchTerms from "../HighlightedSearchTerms";

export type ContextAttributeItem = ContextItem

export default function AttributesList(props: {
    className?: string,
    selectedAttributeIndex: number | null,
    setSelectedAttributeIndex: (index: number | null) => void,
}) {
    const context = useProjectStore((state) => state.context);
    const attributes = (context?.attributes || []).map<ContextAttributeItem>((title, index) => ({ index, title }));
    const selectedAttribute = context && props.selectedAttributeIndex !== null ?
        getContextAttribute(context, props.selectedAttributeIndex) :
        null;

    return (
        <CardContainer
            className={props.className}>
            <ItemsCardContent
                className={cn(selectedAttribute && "hidden")}
                items={attributes}
                title="Attributes"
                count={context?.attributes.length || 0}
                searchInputPlaceholder="Search attributes..."
                itemContent={(item: ContextAttributeItem, regex) =>
                    <HighlightedSearchTerms
                        text={item.title}
                        regex={regex} />}
                itemKey={(item: ContextAttributeItem) => item.index}
                setSelectedItem={(item: ContextAttributeItem) => props.setSelectedAttributeIndex(item.index)}
                itemFilter={searchFilter} />
            {selectedAttribute &&
                <ItemCardContent
                    item={selectedAttribute}
                    backButtonContent="All attributes"
                    itemsHeading={`${selectedAttribute.items.length} object${selectedAttribute.items.length === 1 ? "" : "s"}`}
                    onBackClick={() => props.setSelectedAttributeIndex(null)} />}
        </CardContainer>
    );
}

function getContextAttribute(context: RawFormalContext, attributeIndex: number): ContextCompleteItem {
    if (attributeIndex >= context.attributes.length) {
        throw new Error("Attribute index is out of range");
    }

    const title = context.attributes[attributeIndex];
    const objects = new Array<ContextItem>();

    for (let object = 0; object < context.objects.length; object++) {
        if (formalContextHasAttribute(context, object, attributeIndex)) {
            objects.push({
                index: object,
                title: context.objects[object],
            });
        }
    }

    return {
        index: attributeIndex,
        title,
        items: objects
    };
}