import { useMemo } from "react";
import { Link } from "../../../types/Link";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";

export default function useLinks() {
    const subconceptsMapping = useDataStructuresStore((state) => state.lattice?.subconceptsMapping);
    const layout = useDiagramStore((state) => state.layout);
    const visibleConceptIndexes = useDiagramStore((state) => state.visibleConceptIndexes);
    const filteredConceptIndexes = useDiagramStore((state) => state.filteredConceptIndexes);
    const displayHighlightedSublatticeOnly = useDiagramStore((state) => state.displayHighlightedSublatticeOnly);
    const noInvisibleConcepts = !visibleConceptIndexes || visibleConceptIndexes.size === 0;

    return useMemo(() => {
        const links = new Array<Link>();

        if (!layout || !subconceptsMapping) {
            return links;
        }

        let i = 0;

        for (const node of layout) {
            for (const subconceptIndex of subconceptsMapping[node.conceptIndex]) {
                const isNotVisible = visibleConceptIndexes && !visibleConceptIndexes.has(subconceptIndex);

                if (displayHighlightedSublatticeOnly && isNotVisible) {
                    continue;
                }

                const isVisible = !!visibleConceptIndexes && visibleConceptIndexes.has(node.conceptIndex) && visibleConceptIndexes.has(subconceptIndex);
                const isFiltered = !!filteredConceptIndexes && filteredConceptIndexes.has(node.conceptIndex) && filteredConceptIndexes.has(subconceptIndex);

                const finalIsVisible = noInvisibleConcepts ? isFiltered : isVisible && (!displayHighlightedSublatticeOnly || isFiltered);

                links.push({
                    conceptIndex: node.conceptIndex,
                    subconceptIndex,
                    linkId: i,
                    isVisible: finalIsVisible,
                    isHighlighted: finalIsVisible,
                });
                i++;
            }
        }

        return links;
    }, [subconceptsMapping, visibleConceptIndexes, filteredConceptIndexes, displayHighlightedSublatticeOnly, layout, noInvisibleConcepts]);
}