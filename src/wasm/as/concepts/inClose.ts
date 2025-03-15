import { parseBurmeister } from "../parsing/burmeister";
import { createQueue, dequeue, enqueue, isQueueEmpty } from "../structures/queue";
import { FormalConcept } from "../types/FormalConcept";
import { FormalContext, formalContextHasAttribute, hasObjectWithAllAttributes } from "../types/FormalContext";
import { LinkedList } from "../types/LinkedList";
import { FormalConceptsTimedResult } from "../types/TimedResult";
import { copyArray, copyStaticArray } from "../utils/arrays";

export function inCloseBurmeister(burmeisterContext: string): FormalConceptsTimedResult {
    const context = parseBurmeister(burmeisterContext);
    return inClose(context);
}

export function inClose(context: FormalContext): FormalConceptsTimedResult {
    const startTime = Date.now();

    const initialConceptObjects = new StaticArray<i32>(context.objects.length);
    for (let i = 0; i < context.objects.length; i++)
        initialConceptObjects[i] = i;

    const newExtentBuffer = new StaticArray<i32>(context.objects.length);
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
        const conceptAttributes = new Array<i32>(context.attributes.length);
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
    newExtentBuffer: StaticArray<i32>,
    formalConcepts: Array<FormalConcept>,
    parentConcept: FormalConcept,
    currentAttribute: i32
): void {
    const queue: LinkedList<FormalConcept> = createQueue<FormalConcept>();

    for (let j = currentAttribute; j < context.attributes.length; j++) {
        let lastObjectIndex: i32 = 0;

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
                const newIntent = copyArray<i32>(parentConcept.attributes, parentConcept.attributes.length + 1);
                newIntent[newIntent.length - 1] = j;
                const newConcept: FormalConcept = {
                    attributes: newIntent,
                    objects: copyStaticArray<i32>(newExtentBuffer, lastObjectIndex),
                    attribute: j
                };
                formalConcepts.push(newConcept);

                enqueue<FormalConcept>(queue, newConcept);
                //inCloseImpl(context, newExtentBuffer, formalConcepts, newConcept, j + 1);
            }
        }
    }

    while (!isQueueEmpty(queue)) {
        const concept = dequeue<FormalConcept>(queue, parentConcept);

        if (concept === parentConcept) {
            return;
        }

        inCloseImpl(context, newExtentBuffer, formalConcepts, concept, concept.attribute + 1);
    }
}

function isCannonical(
    context: FormalContext,
    parentConcept: FormalConcept,
    newExtentBuffer: StaticArray<i32>,
    newExtentSize: i32,
    startingAttribute: i32,
): boolean {
    for (let k = parentConcept.attributes.length - 1; k >= 0; k--) {
        for (let j = startingAttribute; j >= parentConcept.attributes[k] + 1; j--) {
            let h: i32;

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
        let h: i32;

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

/*
export function inClose(context: FormalContext): Array<FormalConcept> {
    const startTime = Date.now();

    const initialConceptObjects = new StaticArray<i32>(context.objects.length);
    for (let i = 0; i < context.objects.length; i++)
        initialConceptObjects[i] = i;

    const newExtentBuffer = new StaticArray<i32>(context.objects.length);
    const initialConcept: FormalConcept = { attributes: [], objects: initialConceptObjects, attribute: 0 };
    const formalConcepts = new Array<FormalConcept>();
    formalConcepts.push(initialConcept);
    
    inCloseImpl(
        context,
        newExtentBuffer,
        formalConcepts,
        initialConcept,
        0,
        createZeroIntent(context.attributes.length));

    if (!hasObjectWithAllAttributes(context)) {
        const conceptAttributes = new Array<i32>(context.attributes.length);
        for (let i = 0; i < context.attributes.length; i++)
            conceptAttributes[i] = i;

        formalConcepts.push({ attributes: conceptAttributes, objects: [], attribute: 0 });
    }

    console.log(`InClose: ${Date.now() - startTime} ms`);

    return formalConcepts;
}

function inCloseImpl(
    context: FormalContext,
    newExtentBuffer: StaticArray<i32>,
    formalConcepts: Array<FormalConcept>,
    parentConcept: FormalConcept,
    currentAttribute: i32,
    booleanParentIntent: StaticArray<u64>
): void {
    const queue: LinkedList<FormalConcept> = createQueue<FormalConcept>();

    for (let j = currentAttribute; j < context.attributes.length; j++) {
        if (!intentHasAttribute(booleanParentIntent, j)) {
            let lastObjectIndex: i32 = 0;

            // Take those objects from the parentConcept that have attribute j, i.e. generate a new potential extent
            for (let i = 0; i < parentConcept.objects.length; i++) {
                const object = parentConcept.objects[i];
                if (formalContextHasAttribute(context, object, j)) {
                    newExtentBuffer[lastObjectIndex] = object;
                    lastObjectIndex++;
                }
            }

            if (lastObjectIndex === 0) {
                addAttributeToIntent(booleanParentIntent, j);
            }
            else {
                if (lastObjectIndex < parentConcept.objects.length) {
                    if (isCannonical(context, parentConcept, newExtentBuffer, lastObjectIndex, j - 1)) {
                        const newIntent = copyArray<i32>(parentConcept.attributes, parentConcept.attributes.length + 1);
                        newIntent[newIntent.length - 1] = j;
                        const newConcept: FormalConcept = {
                            attributes: newIntent,
                            objects: copyStaticArray<i32>(newExtentBuffer, lastObjectIndex),
                            attribute: j
                        };
                        formalConcepts.push(newConcept);
    
                        enqueue<FormalConcept>(queue, newConcept);
                        //inCloseImpl(context, newExtentBuffer, formalConcepts, newConcept, j + 1);
                    }
                }
                else {
                    parentConcept.attributes.push(j);
                    addAttributeToIntent(booleanParentIntent, j);
                }
            }
        }
    }

    while (!isQueueEmpty(queue)) {
        const concept = dequeue<FormalConcept>(queue, parentConcept);

        if (concept === parentConcept) {
            return;
        }

        const booleanChildIntent = copyStaticArray<u64>(booleanParentIntent, booleanParentIntent.length);
        addAttributeToIntent(booleanChildIntent, concept.attribute);

        inCloseImpl(context, newExtentBuffer, formalConcepts, concept, concept.attribute + 1, booleanChildIntent);
    }
}

function isCannonical(
    context: FormalContext,
    parentConcept: FormalConcept,
    newExtentBuffer: StaticArray<i32>,
    newExtentSize: i32,
    startingAttribute: i32,
): boolean {
    for (let k = parentConcept.attributes.length - 1; k >= 0; k--) {
        for (let j = startingAttribute; j >= parentConcept.attributes[k] + 1; j--) {
            let h: i32;

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
        let h: i32;

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

function createZeroIntent(attributesCount: i32): StaticArray<u64> {
    const cellsCount = <i32>Math.ceil(<f64>attributesCount / BOOLEAN_CELL_SIZE);
    const intent = new StaticArray<u64>(cellsCount);

    for (let i = 0; i < intent.length; i++) {
        intent[i] = 0;
    }

    return intent;
}

function intentHasAttribute(intent: StaticArray<u64>, attribute: i32): boolean {
    const cell = attribute / BOOLEAN_CELL_SIZE;
    const cellValue: u64 = intent[cell];
    const mask: u64 = 1 << (attribute % BOOLEAN_CELL_SIZE);

    return (cellValue & mask) !== 0;
}

function addAttributeToIntent(intent: StaticArray<u64>, attribute: i32): void {
    const cell = attribute / BOOLEAN_CELL_SIZE;
    const cellValue: u64 = intent[cell];
    const mask: u64 = 1 << (attribute % BOOLEAN_CELL_SIZE);

    intent[cell] = cellValue | mask;
}
*/