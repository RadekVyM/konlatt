import { formalContextHasAttribute, FormalContext } from "../../types/FormalContext";
import { CardContainer } from "../CardContainer";
import ItemsCardContent from "./ItemsCardContent";
import ItemCardContent from "./ItemCardContent";
import { ContextCompleteItem, ContextItem } from "./types";
import { cn } from "../../utils/tailwind";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import useContextStore from "../../stores/useContextStore";

type ContextObjectItem = ContextItem

export default function ObjectsList(props: {
    className?: string,
    route: string,
}) {
    const context = useDataStructuresStore((state) => state.context);
    const selectedObjectIndex = useContextStore((state) => state.selectedObject);
    const setSelectedObjectIndex = useContextStore((state) => state.setSelectedObject);
    const objects = (context?.objects || []).map<ContextObjectItem>((title, index) => ({ index, title }));
    const selectedObject = context && selectedObjectIndex !== null ?
        getContextObject(context, selectedObjectIndex) :
        null;

    return (
        <CardContainer
            className={props.className}>
            <ItemsCardContent
                className={cn(selectedObject && "hidden")}
                items={objects}
                title="Objects"
                route={`${props.route}/objects`}
                count={context?.objects.length || 0}
                searchInputPlaceholder="Search objects..."
                filterTitle="Filter objects"
                sortTitle="Sort objects"
                itemContent={(item: ContextObjectItem, regex) =>
                    <HighlightedSearchTerms
                        text={item.title}
                        regex={regex} />}
                itemKey={(item: ContextObjectItem) => item.index}
                setSelectedItem={(item: ContextObjectItem) => setSelectedObjectIndex(item.index)} />
            {selectedObject &&
                <ItemCardContent
                    item={selectedObject}
                    route={`${props.route}/object`}
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