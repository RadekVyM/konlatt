import { useState } from "react";
import useEventListener from "../../hooks/useEventListener";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { searchTermsToRegex } from "../../utils/search";
import ConceptItemsList from "./ConceptItemsList";
import { StoreApi, UseBoundStore } from "zustand";
import Container from "../layouts/Container";

type StoreType = UseBoundStore<Pick<StoreApi<{
    hoveredConceptIndex: number | null,
    searchTerms: Array<string>,
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
}>, 'getState' | 'getInitialState' | 'subscribe'>>

export default function ConceptHoverDetail(props: {
    useStore: StoreType,
}) {
    const hoveredConceptIndex = props.useStore((state) => state.hoveredConceptIndex);
    const searchTerms = props.useStore((state) => state.searchTerms);
    const selectedFilterObjects = props.useStore((state) => state.selectedFilterObjects);
    const selectedFilterAttributes = props.useStore((state) => state.selectedFilterAttributes);
    const concepts = useDataStructuresStore((state) => state.concepts);
    const context = useDataStructuresStore((state) => state.context);
    
    const [position, setPosition] = useState<[number, number]>([0, 0]);
    const concept = hoveredConceptIndex !== null && concepts ? concepts[hoveredConceptIndex] : null;
    const searchRegex = searchTermsToRegex(searchTerms);

    useEventListener("pointermove", (e) => {
        setPosition([window.innerWidth - e.clientX, window.innerHeight - e.clientY]);
    });

    if (!context || !concept) {
        return undefined;
    }

    return (
        <Container
            className="fixed z-50 pointer-events-none px-2 py-1 max-w-xl ml-2 mt-2 mr-1 mb-1 shadow-shade drop-shadow-2xl animate-fadeIn"
            as="article"
            style={{
                right: position[0],
                bottom: position[1],
            }}>
            <div className="mb-0.5 text-sm line-clamp-8">
                <ConceptItemsList
                    noItemsText="No objects"
                    contextItems={context.objects}
                    filterItems={selectedFilterObjects}
                    items={concept.objects}
                    searchRegex={searchRegex} />
            </div>
            <div className="text-on-surface-container-muted text-xs line-clamp-8">
                <ConceptItemsList
                    noItemsText="No attributes"
                    contextItems={context.attributes}
                    filterItems={selectedFilterAttributes}
                    items={concept.attributes}
                    searchRegex={searchRegex} />
            </div>
        </Container>
    );
}