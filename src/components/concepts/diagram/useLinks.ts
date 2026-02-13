import { useMemo } from "react";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { getLinks } from "../../../utils/diagram";

export default function useLinks() {
    const lattice = useDataStructuresStore((state) => state.lattice);
    const layout = useDiagramStore((state) => state.layout);
    const sublatticeConceptIndexes = useDiagramStore((state) => state.sublatticeConceptIndexes);
    const filteredConceptIndexes = useDiagramStore((state) => state.filteredConceptIndexes);
    const displayHighlightedSublatticeOnly = useDiagramStore((state) => state.displayHighlightedSublatticeOnly);
    const noInvisibleConcepts = !sublatticeConceptIndexes || sublatticeConceptIndexes.size === 0;

    return useMemo(() => {
        return getLinks(
            layout,
            lattice?.subconceptsMapping || null,
            sublatticeConceptIndexes,
            filteredConceptIndexes,
            displayHighlightedSublatticeOnly);
        // The last false in the deps array is needed to make it stable when lattice, layout... are null
        // I have no idea why this is, it is super weird
    }, [lattice, sublatticeConceptIndexes, filteredConceptIndexes, layout, displayHighlightedSublatticeOnly, noInvisibleConcepts, false]);
}