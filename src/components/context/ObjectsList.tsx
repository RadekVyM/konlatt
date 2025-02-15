import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import { formalContextHasAttribute, RawFormalContext } from "../../types/RawFormalContext";
import { CardContainer } from "../CardContainer";
import ItemsCardContent from "./ItemsCardContent";
import ItemCardContent from "./ItemCardContent";
import { ContextCompleteItem, ContextItem } from "./types";
import { searchFilter } from "./utils";
import { cn } from "../../utils/tailwind";

type ContextObjectItem = ContextItem

export default function ObjectsList(props: {
    className?: string,
    selectedObjectIndex: number | null,
    setSelectedObjectIndex: (index: number | null) => void,
}) {
    const context = useConceptLatticeStore((state) => state.context);
    const objects = (context?.objects || []).map<ContextObjectItem>((title, index) => ({ index, title }));
    const selectedObject = context && props.selectedObjectIndex !== null ?
        getContextObject(context, props.selectedObjectIndex) :
        null;

    return (
        <CardContainer
            className={props.className}>
            <ItemsCardContent
                className={cn(selectedObject && "hidden")}
                items={objects}
                title="Objects"
                count={context?.objects.length || 0}
                searchInputPlaceholder="Search objects..."
                itemContent={(item: ContextObjectItem) => item.title}
                itemKey={(item: ContextObjectItem) => item.index}
                setSelectedItem={(item: ContextObjectItem) => props.setSelectedObjectIndex(item.index)}
                itemFilter={searchFilter} />
            {selectedObject &&
                <ItemCardContent
                    item={selectedObject}
                    backButtonContent="All objects"
                    itemsHeading={`${selectedObject.items.length} attribute${selectedObject.items.length === 1 ? "" : "s"}`}
                    onBackClick={() => props.setSelectedObjectIndex(null)} />}
        </CardContainer>
    );
}

function getContextObject(context: RawFormalContext, objectIndex: number): ContextCompleteItem {
    if (objectIndex >= context.objects.length) {
        throw new Error("Object index is out of range");
    }

    const title = context.objects[objectIndex];
    const attributes = new Array<ContextItem>();

    for (let attribute = 0; attribute < context.attributes.length; attribute++) {
        if (formalContextHasAttribute(context, objectIndex, attribute)) {
            attributes.push({
                index: attribute,
                title: context.attributes[attribute],
            });
        }
    }

    return {
        index: objectIndex,
        title,
        items: attributes
    };
}