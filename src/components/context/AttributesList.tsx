import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import { formalContextHasAttribute, RawFormalContext } from "../../types/RawFormalContext";
import { CardSection } from "../CardSection";
import ItemsCardContent from "./ItemsCardContent";
import ItemCardContent from "./ItemCardContent";
import { ContextCompleteItem, ContextItem } from "./types";
import { searchFilter } from "./utils";

export type ContextAttributeItem = ContextItem

export default function AttributesList(props: {
    className?: string,
    selectedAttributeIndex: number | null,
    setSelectedAttributeIndex: (index: number | null) => void,
}) {
    const context = useConceptLatticeStore((state) => state.context);
    const attributes = (context?.attributes || []).map<ContextAttributeItem>((title, index) => ({ index, title }));
    const selectedAttribute = context && props.selectedAttributeIndex !== null ?
        getContextAttribute(context, props.selectedAttributeIndex) :
        null;

    return (
        <CardSection
            className={props.className}>
            {selectedAttribute ?
                <ItemCardContent
                    item={selectedAttribute}
                    backButtonContent="All attributes"
                    onBackClick={() => props.setSelectedAttributeIndex(null)} /> :
                <ItemsCardContent
                    items={attributes}
                    title="Attributes"
                    count={context?.attributes.length || 0}
                    searchInputPlaceholder="Search attributes..."
                    itemContent={(item: ContextAttributeItem) => item.title}
                    itemKey={(item: ContextAttributeItem) => item.index}
                    setSelectedItem={(item: ContextAttributeItem) => props.setSelectedAttributeIndex(item.index)}
                    itemFilter={searchFilter} />}
        </CardSection>
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