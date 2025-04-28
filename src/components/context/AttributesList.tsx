import { formalContextHasAttribute, FormalContext } from "../../types/FormalContext";
import { CardContainer } from "../CardContainer";
import ItemsCardContent from "./ItemsCardContent";
import ItemCardContent from "./ItemCardContent";
import { ContextCompleteItem, ContextItem } from "./types";
import { cn } from "../../utils/tailwind";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import useDataStructuresStore from "../../hooks/stores/useDataStructuresStore";

export type ContextAttributeItem = ContextItem

export default function AttributesList(props: {
    className?: string,
    route: string,
    selectedAttributeIndex: number | null,
    setSelectedAttributeIndex: (index: number | null) => void,
}) {
    const context = useDataStructuresStore((state) => state.context);
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
                route={`${props.route}/attributes`}
                count={context?.attributes.length || 0}
                searchInputPlaceholder="Search attributes..."
                filterTitle="Filter attributes"
                sortTitle="Sort attributes"
                itemContent={(item: ContextAttributeItem, regex) =>
                    <HighlightedSearchTerms
                        text={item.title}
                        regex={regex} />}
                itemKey={(item: ContextAttributeItem) => item.index}
                setSelectedItem={(item: ContextAttributeItem) => props.setSelectedAttributeIndex(item.index)} />
            {selectedAttribute &&
                <ItemCardContent
                    item={selectedAttribute}
                    route={`${props.route}/attribute`}
                    backButtonContent="All attributes"
                    itemsHeading={`${selectedAttribute.items.length} object${selectedAttribute.items.length === 1 ? "" : "s"}`}
                    onBackClick={() => props.setSelectedAttributeIndex(null)} />}
        </CardContainer>
    );
}

function getContextAttribute(context: FormalContext, attributeIndex: number): ContextCompleteItem {
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