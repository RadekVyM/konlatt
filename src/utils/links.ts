import { ConceptLattice } from "../types/ConceptLattice";
import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";
import { Link } from "../types/Link";

export function getLinks(
    layout: ConceptLatticeLayout | null,
    lattice: ConceptLattice | null,
    visibleConceptIndexes: Set<number> | null,
    filteredConceptIndexes: Set<number> | null,
    displayHighlightedSublatticeOnly: boolean,
) {
    const links = new Array<Link>();
    const noInvisibleConcepts = !visibleConceptIndexes || visibleConceptIndexes.size === 0;

    if (!layout || !lattice?.subconceptsMapping) {
        return links;
    }

    let i = 0;

    for (const node of layout) {
        for (const subconceptIndex of lattice.subconceptsMapping[node.conceptIndex]) {
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
}