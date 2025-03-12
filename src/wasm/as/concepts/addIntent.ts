import { FormalContext, formalContextHasAttribute } from "../types/FormalContext";
import { copyArray, createSequence, isSortedSubsetOf, sortedIntersect } from "../utils/arrays";

export function addIntent(context: FormalContext): ResultLattice {
    // TODO: There are probably too many allocations => out of memory errors
    // Using GC does not work
    /*
    RuntimeError: unreachable
    ❯ ~lib/rt/tlsf/growMemory wasm:/wasm/0004dfda:1:3377
    ❯ ~lib/rt/tlsf/allocateBlock wasm:/wasm/0004dfda:1:3606
    ❯ ~lib/rt/tlsf/__alloc wasm:/wasm/0004dfda:1:3707
    ❯ ~lib/rt/tcms/__new wasm:/wasm/0004dfda:1:3895
    ❯ ~lib/array/Array<i32>#constructor wasm:/wasm/0004dfda:1:10149
    ❯ ~lib/set/Set<i32>#values wasm:/wasm/0004dfda:1:14801
    ❯ src/as/assembly/concepts/addIntent/addObject wasm:/wasm/0004dfda:1:16658
    ❯ src/as/assembly/concepts/addIntent/addObject wasm:/wasm/0004dfda:1:16710
    ❯ src/as/assembly/concepts/addIntent/addObject wasm:/wasm/0004dfda:1:16710
    ❯ src/as/assembly/concepts/addIntent/addObject wasm:/wasm/0004dfda:1:16710

    RuntimeError: unreachable
    ❯ ~lib/rt/tlsf/growMemory wasm:/wasm/000612de:1:4603
    ❯ ~lib/rt/tlsf/allocateBlock wasm:/wasm/000612de:1:4832
    ❯ ~lib/rt/tlsf/__alloc wasm:/wasm/000612de:1:4933
    ❯ ~lib/rt/itcms/__new wasm:/wasm/000612de:1:5005
    ❯ ~lib/rt/itcms/__renew wasm:/wasm/000612de:1:5799
    ❯ ~lib/array/ensureCapacity wasm:/wasm/000612de:1:16818
    ❯ ~lib/array/Array<i32>#push wasm:/wasm/000612de:1:17539
    ❯ src/as/assembly/concepts/addIntent/addObject wasm:/wasm/000612de:1:28249
    ❯ src/as/assembly/concepts/addIntent/addObject wasm:/wasm/000612de:1:28313
    ❯ src/as/assembly/concepts/addIntent/addObject wasm:/wasm/000612de:1:28313
    */
    const startTime = Date.now();

    const bottomConcept: AddFormalConcept = {
        objects: [],
        attributes: createSequence(context.attributes.length),
        index: 0,
    };

    const formalConcepts = new Array<AddFormalConcept>(1);
    formalConcepts[0] = bottomConcept;
    const coverageRelation = new Array<Set<i32>>(1);
    coverageRelation[0] = new Set<i32>();

    const lattice: Lattice = {
        formalConcepts,
        coverageRelation
    };

    for (let object = 0; object < context.objects.length; object++) {
        const intent = getIntent(context, object);

        const newConcept = addIntentImpl(intent, bottomConcept, lattice);
        addObject(newConcept.index, lattice, object);
    }

    console.log(`AddIntent: ${Date.now() - startTime} ms`);

    // Convert the sets to arrays

    const result: ResultLattice = {
        formalConcepts: lattice.formalConcepts,
        coverageRelation: lattice.coverageRelation.map<Array<i32>>((set) => set.values())
    };

    return result;
}

function addIntentImpl(intent: Array<i32>, generatorConcept: AddFormalConcept, lattice: Lattice): AddFormalConcept {
    generatorConcept = getMaximalConcept(intent, generatorConcept, lattice);

    //if (isSortedSubsetOf(generatorConcept.attributes, intent) && isSortedSubsetOf(intent, generatorConcept.attributes)) {
    if (generatorConcept.attributes.length === intent.length) {
        return generatorConcept;
    }

    const generatorParents = lattice.coverageRelation[generatorConcept.index].values();
    const newParents = new Array<i32>();
    let newParentsCount = 0;

    for (let i = 0; i < generatorParents.length; i++) {
        let candidate = lattice.formalConcepts[generatorParents[i]];

        if (!isSortedSubsetOf(candidate.attributes, intent)) {
            candidate = addIntentImpl(sortedIntersect(candidate.attributes, intent), candidate, lattice);
        }

        let addParent = true;

        for (let j = 0; j < newParentsCount; j++) {
            const parent = lattice.formalConcepts[newParents[j]];

            if (isSortedSubsetOf(candidate.attributes, parent.attributes)) {
                addParent = false;
                break;
            }
            else if (isSortedSubsetOf(parent.attributes, candidate.attributes)) {
                // remove parent from newParents
                // == move last parent to j and iterate over j again
                newParentsCount--;
                newParents[j] = newParents[newParentsCount];
                j--;
            }
        }

        if (addParent) {
            newParents[newParentsCount] = candidate.index;
            newParentsCount++;
        }
    }

    const newConcept: AddFormalConcept = {
        objects: copyArray(generatorConcept.objects, generatorConcept.objects.length),
        attributes: copyArray(intent, intent.length),
        index: lattice.formalConcepts.length
    };
    lattice.formalConcepts[lattice.formalConcepts.length] = newConcept;
    lattice.coverageRelation[newConcept.index] = new Set<i32>();

    // work out the links
    for (let i = 0; i < newParentsCount; i++) {
        const parent = lattice.formalConcepts[newParents[i]];
        
        lattice.coverageRelation[generatorConcept.index].delete(parent.index);
        lattice.coverageRelation[newConcept.index].add(parent.index);
    }
    
    lattice.coverageRelation[generatorConcept.index].add(newConcept.index);

    return newConcept;
}

function getMaximalConcept(intent: Array<i32>, generatorConcept: AddFormalConcept, lattice: Lattice): AddFormalConcept {
    let parentIsMaximal = true;

    while (parentIsMaximal) {
        parentIsMaximal = false;

        const parents = lattice.coverageRelation[generatorConcept.index].values();

        for (let i = 0; i < parents.length; i++) {
            const parent = lattice.formalConcepts[parents[i]];

            if (isSortedSubsetOf(intent, parent.attributes)) {
                generatorConcept = parent;
                parentIsMaximal = true;
            }
        }
    }

    return generatorConcept;
}

function addObject(conceptIndex: i32, lattice: Lattice, object: i32): void {
    const parents = lattice.coverageRelation[conceptIndex].values();
    const concept = lattice.formalConcepts[conceptIndex];
    concept.objects.push(object);

    for (let i = 0; i < parents.length; i++) {
        addObject(parents[i], lattice, object);
    }
}

function getIntent(context: FormalContext, object: i32): Array<i32> {
    const intent = new Array<i32>();

    for (let attribute = 0; attribute < context.attributes.length; attribute++) {
        if (formalContextHasAttribute(context, object, attribute)) {
            intent.push(attribute);
        }
    }

    return intent;
}

class Lattice {
    formalConcepts: Array<AddFormalConcept> = [];
    coverageRelation: Array<Set<i32>> = [];
}

class ResultLattice {
    formalConcepts: Array<AddFormalConcept> = [];
    coverageRelation: Array<Array<i32>> = [];
}

class AddFormalConcept {
    objects: Array<i32> = [];
    attributes: Array<i32> = [];
    index: i32 = -1;
}