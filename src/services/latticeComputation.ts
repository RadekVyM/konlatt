import { __collect, conceptsToLattice as conceptsToLatticeAs } from "../as"
import { ConceptLattice } from "../types/ConceptLattice";
import { ConceptLatticeLabeling } from "../types/ConceptLatticeLabeling";
import { FormalConcept, FormalConcepts, getInfimum, getSupremum } from "../types/FormalConcepts";
import { breadthFirstSearch } from "../utils/graphs";

/**
 * 
 * @param concepts 
 * @returns Array of indexes of children of each concept
 */
export function conceptsToLattice(concepts: FormalConcepts): ConceptLattice {
    // I need to be cautious with the types here
    const lattice = conceptsToLatticeAs(concepts as any);
    __collect();

    const subconceptsMapping = lattice.map((set) => new Set<number>(set));
    const superconceptsMapping = subconceptsToSuperconcetsMapping(subconceptsMapping);
    // TODO: Does the labeling work?
    const objectsLabeling = getObjectsLabeling(concepts, superconceptsMapping);
    const attributesLabeling = getAttributesLabeling(concepts, subconceptsMapping);

    return {
        subconceptsMapping,
        superconceptsMapping,
        objectsLabeling,
        attributesLabeling,
    };
}

function subconceptsToSuperconcetsMapping(subconceptsMapping: Array<Set<number>>) {
    const superconceptsMapping = new Array<Set<number>>(subconceptsMapping.length);

    for (let i = 0; i < subconceptsMapping.length; i++) {
        const subconcepts = subconceptsMapping[i];

        for (const subconcept of subconcepts) {
            if (superconceptsMapping[subconcept] === undefined) {
                superconceptsMapping[subconcept] = new Set<number>();
            }

            superconceptsMapping[subconcept].add(i);
        }
    }

    for (let i = 0; i < subconceptsMapping.length; i++) {
        if (superconceptsMapping[i] === undefined) {
            superconceptsMapping[i] = new Set<number>();
        }
    }

    return superconceptsMapping;
}

function getObjectsLabeling(concepts: FormalConcepts, superconceptsMapping: ReadonlyArray<Set<number>>): ConceptLatticeLabeling {
    const infimum = getInfimum(concepts);

    return getLabeling(concepts, infimum.index, superconceptsMapping, (concept) => concept.objects);
}

function getAttributesLabeling(concepts: FormalConcepts, subconceptsMapping: ReadonlyArray<Set<number>>): ConceptLatticeLabeling {
    const supremum = getSupremum(concepts);

    return getLabeling(concepts, supremum.index, subconceptsMapping, (concept) => concept.attributes);
}

function getLabeling(
    concepts: FormalConcepts,
    startIndex: number,
    relation: ReadonlyArray<Set<number>>,
    conceptItems: (concept: FormalConcept) => ReadonlyArray<number>
): ConceptLatticeLabeling {
    const labeling = new Map<number, ReadonlyArray<number>>();
    const alreadyAppeared = new Set<number>();

    breadthFirstSearch(startIndex, relation, (currentIndex) => {
        const concept = concepts[currentIndex];
        const labels = new Array<number>();

        for (const item of conceptItems(concept)) {
            if (!alreadyAppeared.has(item)) {
                alreadyAppeared.add(item);
                labels.push(item);
            }
        }

        labeling.set(currentIndex, labels);
    });

    return labeling;
}