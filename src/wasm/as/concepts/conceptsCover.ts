import { IndexedFormalConcept } from "../types/FormalConcept";
import { FormalContext, formalContextHasAttribute } from "../types/FormalContext";
import { createZeroSequence } from "../utils/arrays";

export function conceptsCover(concepts: Array<IndexedFormalConcept>, formalContext: FormalContext): Array<Array<i32>> {
    const startTime = Date.now();

    const counts = createZeroSequence(concepts.length);

    // sort concepts by intent's length from smallest to biggest
    concepts.sort((first, second) => second.objects.length - first.objects.length);

    // lattice[i] = a set of direct subconcepts of a concept concepts[i]
    const lattice: StaticArray<LatticeMapping> = new StaticArray<LatticeMapping>(concepts.length);
    for (let i = 0; i < concepts.length; i++) {
        lattice[i] = { mapping: new Array<i32>(), index: concepts[i].index };
    }

    const inters = new StaticArray<i32>(formalContext.objects.length);

    for (let i = 0; i < concepts.length; i++) {
        const concept = concepts[i];

        for (let j = 0; j < concepts.length; j++) {
            counts[j] = 0;
        }

        let ignoredConceptAttributeIndex = 0;

        for (let m = 0; m < formalContext.attributes.length; m++) {
            if (ignoredConceptAttributeIndex < concept.attributes.length) {
                const ignoredAttribute = concept.attributes[ignoredConceptAttributeIndex];
                
                if (ignoredAttribute === m) {
                    ignoredConceptAttributeIndex++;
                    continue;
                }
            }

            const intersCount = computeInters(inters, m, concept.objects, formalContext);

            // find corresponding concept - this is potentially slow
            // using binary search to reduce the initial value of anotherConceptIndex
            let anotherConceptIndex: i32 = findFirstOccurrence(concepts, intersCount);

            for (; anotherConceptIndex < concepts.length; anotherConceptIndex++) {
                const anotherConcept = concepts[anotherConceptIndex];

                if (arraysEqual(anotherConcept.objects, inters, intersCount)) {
                    break;
                }
            }

            const anotherConcept: IndexedFormalConcept = concepts[anotherConceptIndex];
            counts[anotherConceptIndex] = counts[anotherConceptIndex] + 1;

            if (anotherConcept.attributes.length - concept.attributes.length === counts[anotherConceptIndex]) {
                // add edge from anotherConcept to concept
                lattice[anotherConceptIndex].mapping.push(i);
            }
        }
    }

    console.log(`ConceptsCover: ${Date.now() - startTime} ms`);

    const result = new Array<Array<i32>>(lattice.length);

    // Ensure the original order of concepts
    for (let i = 0; i < lattice.length; i++) {
        const value = lattice[i];
        const subconcepts = result[value.index] = new Array<i32>(value.mapping.length);

        for (let j = 0; j < value.mapping.length; j++) {
            subconcepts[j] = value.mapping[j];
        }

        for (let j = 0; j < subconcepts.length; j++) {
            subconcepts[j] = lattice[subconcepts[j]].index;
        }
    }

    return result;
}

class LatticeMapping {
    mapping: Array<i32> = new Array<i32>();
    index: i32 = -1;
}

function computeInters(inters: StaticArray<i32>, m: i32, conceptObjects: StaticArray<i32>, formalContext: FormalContext): i32 {
    let intersIndex = 0;

    for (let i = 0; i < conceptObjects.length; i++) {
        const object = conceptObjects[i];

        if (formalContextHasAttribute(formalContext, object, m)) {
            inters[intersIndex] = object;
            intersIndex++;
        }
    }

    return intersIndex;
}

function arraysEqual(first: StaticArray<i32>, second: StaticArray<i32>, secondLength: i32): boolean {
    if (first.length !== secondLength) {
        return false;
    }

    for (let i = 0; i < first.length; i++) {
        if (first[i] !== second[i]) {
            return false;
        }
    }

    return true;
}

function findFirstOccurrence(arr: Array<IndexedFormalConcept>, target: i32): i32 {
    let low: i32 = 0;
    let high: i32 = arr.length - 1;
    let result: i32 = -1; // Initialize result to -1 (not found)

    while (low <= high) {
        const mid = <i32>Math.floor((low + high) / 2); // Calculate the middle index

        if (arr[mid].objects.length === target) {
            result = mid; // Found a match, but check for earlier occurrences
            high = mid - 1; // Search in the left half for potential earlier occurrences
        } else if (arr[mid].objects.length > target) {
            low = mid + 1; // Target is in the right half
        } else {
            high = mid - 1; // Target is in the left half
        }
    }

    return result; // Return the index of the first occurrence, or -1 if not found
}

/*
// Trie variant
// creating the trie data structure is tooooo slow

export function conceptsCover(concepts: Array<IndexedFormalConcept>, formalContext: FormalContext): Array<Array<i32>> {
    const startTime = Date.now();

    const counts = createZeroSequence(concepts.length);

    // sort concepts by intent's length from smallest to biggest
    concepts.sort((first, second) => second.objects.length - first.objects.length);

    // lattice[i] = a set of direct subconcepts of a concept concepts[i]
    const lattice: StaticArray<LatticeMapping> = new StaticArray<LatticeMapping>(concepts.length);
    for (let i = 0; i < concepts.length; i++) {
        lattice[i] = { mapping: new Array<i32>(), index: concepts[i].index };
    }

    const trie = createObjectTrie(concepts);

    const inters = new StaticArray<i32>(formalContext.objects.length);

    for (let i = 0; i < concepts.length; i++) {
        const concept = concepts[i];

        for (let j = 0; j < concepts.length; j++) {
            counts[j] = 0;
        }

        let ignoredConceptAttributeIndex = 0;

        for (let m = 0; m < formalContext.attributes.length; m++) {
            if (ignoredConceptAttributeIndex < concept.attributes.length) {
                const ignoredAttribute = concept.attributes[ignoredConceptAttributeIndex];
                
                if (ignoredAttribute === m) {
                    ignoredConceptAttributeIndex++;
                    continue;
                }
            }

            const intersCount = computeInters(inters, m, concept.objects, formalContext);

            // find corresponding concept - this is potentially slow
            const anotherConceptIndex = find(trie, inters, intersCount);
            const anotherConcept: IndexedFormalConcept = concepts[anotherConceptIndex];
            counts[anotherConceptIndex] = counts[anotherConceptIndex] + 1;

            if (anotherConcept.attributes.length - concept.attributes.length === counts[anotherConceptIndex]) {
                // add edge from anotherConcept to concept
                lattice[anotherConceptIndex].mapping.push(i);
            }
        }
    }

    console.log(`ConceptsCover: ${Date.now() - startTime} ms`);

    const result = new Array<Array<i32>>(lattice.length);

    // Ensure the original order of concepts
    for (let i = 0; i < lattice.length; i++) {
        const value = lattice[i];
        const subconcepts = result[value.index] = new Array<i32>(value.mapping.length);

        for (let j = 0; j < value.mapping.length; j++) {
            subconcepts[j] = value.mapping[j];
        }

        for (let j = 0; j < subconcepts.length; j++) {
            subconcepts[j] = lattice[subconcepts[j]].index;
        }
    }

    return result;
}

*/