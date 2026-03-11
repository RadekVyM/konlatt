import { FloatArray, FormalConceptArray, SimpleFormalConceptArray, IntArray, IntMultiArray, MainModule, StringArray, UIntArray } from "../cpp";
import { FormalConcept, FormalConcepts } from "../types/FormalConcepts";
import { createPoint, Point } from "../types/Point";

/** Converts a C++ `StringArray` to a JS string generator. */
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

/** Converts a C++ `UIntArray` to a JS number generator. */
export function* cppUIntArrayToJs(cppArray: UIntArray, shouldDelete: boolean = false) {
    for (let i = 0; i < cppArray.size(); i++)
        yield cppArray.get(i)!;

    if (shouldDelete) {
        cppArray.delete();
    }
}

/** Converts a C++ `IntArray` to a JS number generator. */
export function* cppIntArrayToJs(cppArray: IntArray, shouldDelete: boolean = false) {
    for (let i = 0; i < cppArray.size(); i++)
        yield cppArray.get(i)!;

    if (shouldDelete) {
        cppArray.delete();
    }
}

/** Converts a 2D C++ `IntMultiArray` to a JS generator of number arrays. */
export function* cppIntMultiArrayToJs(cppArray: IntMultiArray, shouldDelete: boolean = false) {
    for (let i = 0; i < cppArray.size(); i++) {
        const value = [...cppIntArrayToJs(cppArray.get(i)!, shouldDelete)];
        yield value;
    }

    if (shouldDelete) {
        cppArray.delete();
    }
}

/** Maps C++ `FormalConcept` objects to JS objects. */
export function* cppFormalConceptArrayToJs(cppArray: FormalConceptArray, shouldDelete: boolean = false): Generator<FormalConcept> {
    for (let i = 0; i < cppArray.size(); i++) {
        const value = cppArray.get(i)!;

        const result: FormalConcept = {
            attributes: [...cppIntArrayToJs(value.getAttributes(), shouldDelete)],
            objects: [...cppIntArrayToJs(value.getObjects(), shouldDelete)],
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

/** Groups flat `FloatArray` data into 3D `Point` objects (x, y, z). */
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

/** Efficiently copies WASM memory from a C++ `FloatArray` to a native JS `Float32Array`. */
export function cppFloatArrayToFloat32Array(
    cppArray: FloatArray,
    module: MainModule,
    shouldDelete: boolean = false
): Float32Array {
    const size = cppArray.size();
    const pointer = module.getFloatVectorAddress(cppArray);
    // Create a view of the WASM memory
    const view = module.HEAPF32.subarray(pointer >> 2, (pointer >> 2) + size);
    const result = new Float32Array(view);

    if (shouldDelete) {
        cppArray.delete();
    }

    return result;
}

/** Creates and populates a new C++ `IntArray` from a JS number array. */
export function jsArrayToCppIntArray(module: MainModule, array: Array<number> | ReadonlyArray<number>): IntArray {
    const cppArray = new module.IntArray();
    cppArray.resize(array.length, 0);

    for (let i = 0; i < array.length; i++) {
        cppArray.set(i, array[i]);
    }

    return cppArray;
}

/** Creates and populates a new C++ `UIntArray` from a JS number array. */
export function jsArrayToCppUIntArray(module: MainModule, array: Array<number> | ReadonlyArray<number>): UIntArray {
    const cppArray = new module.UIntArray();
    cppArray.resize(array.length, 0);

    for (let i = 0; i < array.length; i++) {
        cppArray.set(i, array[i]);
    }

    return cppArray;
}

/** Converts JS `FormalConcept` objects back into C++ `SimpleFormalConcept` objects. */
export function jsArrayToCppSimpleFormalConceptArray(module: MainModule, array: FormalConcepts): SimpleFormalConceptArray {
    const cppArray = new module.SimpleFormalConceptArray();

    for (let i = 0; i < array.length; i++) {
        const concept = new module.SimpleFormalConcept();

        concept.attributes = jsArrayToCppIntArray(module, array[i].attributes);
        concept.objects = jsArrayToCppIntArray(module, array[i].objects);

        cppArray.push_back(concept);
    }

    return cppArray;
}