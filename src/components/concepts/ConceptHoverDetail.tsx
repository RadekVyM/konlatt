import { useState } from "react";
import useEventListener from "../../hooks/useEventListener";
import useDiagramStore from "../../stores/diagram/useDiagramStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import Container from "../Container";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import { searchTermsToRegex } from "../../utils/search";

export default function ConceptHoverDetail() {
    const hoveredConceptDetailEnabled = useDiagramStore((state) => state.hoveredConceptDetailEnabled);

    if (!hoveredConceptDetailEnabled) {
        return undefined;
    }

    return (
        <ConceptCard />
    )
}

function ConceptCard() {
    const hoveredConceptIndex = useDiagramStore((state) => state.hoveredConceptIndex);
    const searchTerms = useDiagramStore((state) => state.searchTerms);
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
            className="fixed z-50 pointer-events-none px-2 py-1 max-w-xl ml-2 mt-2 shadow-shade drop-shadow-2xl animate-fadeIn"
            as="article"
            style={{
                right: position[0],
                bottom: position[1],
            }}>
            <div className="mb-0.5 text-sm line-clamp-8">
                {concept.objects.length > 0 ?
                    <HighlightedSearchTerms
                        text={concept.objects.map((o) => context.objects[o]).join(", ")}
                        regex={searchRegex} /> :
                    <span className="italic">No objects</span>}
            </div>
            <div className="text-on-surface-container-muted text-xs line-clamp-8">
                {concept.attributes.length > 0 ?
                    <HighlightedSearchTerms
                        text={concept.attributes.map((a) => context.attributes[a]).join(", ")}
                        regex={searchRegex} /> :
                    <span className="italic">No attributes</span>}
            </div>
        </Container>
    );
}