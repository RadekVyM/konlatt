import { FormalContext, formalContextHasAttribute } from "../../src/types/FormalContext";

// I just copied the AssembyScript code and replaced the AssembyScript specific stuff with JavaScript alternatives
// It is a messy but simple solution
// AssemblyScript can be transpiled to JavaScript: https://www.assemblyscript.org/compiler.html#portability
// However, it does not currently support some AssembyScript specific stuff, like StaticArray

type FormalConcept = {
    attributes: Array<number>,
    objects: Array<number>,
    attribute: number,
}

export function inClose(context: FormalContext) {
    const startTime = Date.now();

    const initialConceptObjects = new Array<number>(context.objects.length);
    for (let i = 0; i < context.objects.length; i++)
        initialConceptObjects[i] = i;

    const newExtentBuffer = new Array<number>(context.objects.length);
    const initialConcept: FormalConcept = { attributes: [], objects: initialConceptObjects, attribute: 0 };
    const formalConcepts = new Array<FormalConcept>();
    formalConcepts.push(initialConcept);

    inCloseImpl(
        context,
        newExtentBuffer,
        formalConcepts,
        initialConcept,
        0);

    if (!hasObjectWithAllAttributes(context)) {
        const conceptAttributes = new Array<number>(context.attributes.length);
        for (let i = 0; i < context.attributes.length; i++)
            conceptAttributes[i] = i;

        formalConcepts.push({ attributes: conceptAttributes, objects: [], attribute: 0 });
    }

    return {
        value: formalConcepts,
        time: Date.now() - startTime,
    };
}

function inCloseImpl(
    context: FormalContext,
    newExtentBuffer: Array<number>,
    formalConcepts: Array<FormalConcept>,
    parentConcept: FormalConcept,
    currentAttribute: number
): void {
    const queue = new Array<FormalConcept>();

    for (let j = currentAttribute; j < context.attributes.length; j++) {
        let lastObjectIndex: number = 0;

        // Take those objects from the parentConcept that have attribute j, i.e. generate a new potential extent
        for (let i = 0; i < parentConcept.objects.length; i++) {
            const object = parentConcept.objects[i];
            if (formalContextHasAttribute(context, object, j)) {
                newExtentBuffer[lastObjectIndex] = object;
                lastObjectIndex++;
            }
        }

        if (lastObjectIndex > 0) {
            if (lastObjectIndex === parentConcept.objects.length) {
                parentConcept.attributes.push(j);
            }
            else if (isCannonical(context, parentConcept, newExtentBuffer, lastObjectIndex, j - 1)) {
                const newIntent = copyArray(parentConcept.attributes, parentConcept.attributes.length + 1);
                newIntent[newIntent.length - 1] = j;
                const newConcept: FormalConcept = {
                    attributes: newIntent,
                    objects: copyArray(newExtentBuffer, lastObjectIndex),
                    attribute: j
                };
                formalConcepts.push(newConcept);

                queue.push(newConcept);
            }
        }
    }

    while (queue.length !== 0) {
        const concept = queue.shift();

        if (concept) {
            inCloseImpl(context, newExtentBuffer, formalConcepts, concept, concept.attribute + 1);
        }
    }
}

function isCannonical(
    context: FormalContext,
    parentConcept: FormalConcept,
    newExtentBuffer: Array<number>,
    newExtentSize: number,
    startingAttribute: number,
): boolean {
    for (let k = parentConcept.attributes.length - 1; k >= 0; k--) {
        for (let j = startingAttribute; j >= parentConcept.attributes[k] + 1; j--) {
            let h: number;

            for (h = 0; h < newExtentSize; h++) {
                if (!formalContextHasAttribute(context, newExtentBuffer[h], j))
                    break;
            }
            if (h === newExtentSize) {
                return false;
            }
        }
        startingAttribute = parentConcept.attributes[k] - 1;
    }

    for (let j = startingAttribute; j >= 0; j--) {
        let h: number;

        for (h = 0; h < newExtentSize; h++) {
            if (!formalContextHasAttribute(context, newExtentBuffer[h], j))
                break;
        }
        if (h === newExtentSize) {
            return false;
        }
    }

    return true;
}

function hasObjectWithAllAttributes(context: FormalContext): boolean {
    for (let o = 0; o < context.objects.length; o++) {
        let has = true;

        for (let a = 0; a < context.attributes.length; a++) {
            if (!formalContextHasAttribute(context, o, a)) {
                has = false;
                break;
            }
        }

        if (has) {
            return true;
        }
    }

    return false;
}

function copyArray<T>(array: Array<T>, length: number): Array<T> {
    const newArray = new Array<T>(length);

    for (let i = 0; i < Math.min(length, array.length); i++)
        newArray[i] = array[i];

    return newArray;
}