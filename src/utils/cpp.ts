import { FloatArray, FormalConceptArray, IndexedFormalConceptArray, IntArray, IntMultiArray, MainModule, StringArray, UIntArray } from "../wasm/cpp";
import { FormalConcept, FormalConcepts } from "../types/FormalConcepts";
import { createPoint, Point } from "../types/Point";

export function* cppStringArrayToJs(cppArray: StringArray, shouldDelete: boolean = false): Generator<string> {
    for (let i = 0; i < cppArray.size(); i++) {
        const value = cppArray.get(i)!.valueOf();
        if (typeof value === "string") {
            yield value;
        }
    }

    if (shouldDelete) {
        cppArray.delete();
    }
}

export function* cppUIntArrayToJs(cppArray: UIntArray, shouldDelete: boolean = false) {
    for (let i = 0; i < cppArray.size(); i++)
        yield cppArray.get(i)!;

    if (shouldDelete) {
        cppArray.delete();
    }
}

export function* cppIntArrayToJs(cppArray: IntArray, shouldDelete: boolean = false) {
    for (let i = 0; i < cppArray.size(); i++)
        yield cppArray.get(i)!;

    if (shouldDelete) {
        cppArray.delete();
    }
}

export function* cppIntMultiArrayToJs(cppArray: IntMultiArray, shouldDelete: boolean = false) {
    for (let i = 0; i < cppArray.size(); i++) {
        const value = [...cppIntArrayToJs(cppArray.get(i)!, shouldDelete)];
        yield value;
    }

    if (shouldDelete) {
        cppArray.delete();
    }
}

export function* cppFormalConceptArrayToJs(cppArray: FormalConceptArray, shouldDelete: boolean = false): Generator<FormalConcept> {
    for (let i = 0; i < cppArray.size(); i++) {
        const value = cppArray.get(i)!;

        const result: FormalConcept = {
            attributes: [...cppIntArrayToJs(value.attributes, shouldDelete)],
            objects: [...cppIntArrayToJs(value.objects, shouldDelete)],
            index: i,
        };

        if (shouldDelete) {
            value.delete();
        }

        yield result;
    }

    if (shouldDelete) {
        cppArray.delete();
    }
}

export function cppFloatArrayToPoints(cppArray: FloatArray, conceptsCount: number, shouldDelete: boolean = false): Array<Point> {
    const result = new Array<Point>();

    for (let i = 0; i < conceptsCount; i++) {
        const start = i * 3;
        const x = cppArray.get(start)!;
        const y = cppArray.get(start + 1)!;
        const z = cppArray.get(start + 2)!;

        result.push(createPoint(x, y, z));
    }

    if (shouldDelete) {
        cppArray.delete();
    }

    return result;
}

export function jsArrayToCppIntArray(module: MainModule, array: Array<number> | ReadonlyArray<number>): IntArray {
    const cppArray = new module.IntArray();
    cppArray.resize(array.length, 0);

    for (let i = 0; i < array.length; i++) {
        cppArray.set(i, array[i]);
    }

    return cppArray;
}

export function jsArrayToCppUIntArray(module: MainModule, array: Array<number> | ReadonlyArray<number>): UIntArray {
    const cppArray = new module.UIntArray();
    cppArray.resize(array.length, 0);

    for (let i = 0; i < array.length; i++) {
        cppArray.set(i, array[i]);
    }

    return cppArray;
}

export function jsArrayToCppIndexedFormalConceptArray(module: MainModule, array: FormalConcepts): IndexedFormalConceptArray {
    const cppArray = new module.IndexedFormalConceptArray();

    for (let i = 0; i < array.length; i++) {
        const concept = new module.IndexedFormalConcept();

        concept.index = i;
        concept.attributes = jsArrayToCppIntArray(module, array[i].attributes);
        concept.objects = jsArrayToCppIntArray(module, array[i].objects);

        cppArray.push_back(concept);
    }

    return cppArray;
}