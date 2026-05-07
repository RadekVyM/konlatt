import { describe, it, expect, beforeAll } from "vitest";
import { MainModule } from "../../src/cpp";
import Module from "../../src/cpp";
import { cppFloatArrayToFloat32Array, cppFloatArrayToPoints, cppFormalConceptArrayToJs, cppIntArrayToJs, cppIntMultiArrayToJs, cppStringArrayToJs, cppUIntArrayToJs, jsArrayToCppIntArray, jsArrayToCppSimpleFormalConceptArray, jsArrayToCppUIntArray } from "../../src/utils/cpp";
import { FormalConcept } from "../../src/types/FormalConcepts";

describe("C++ utils", () => {
    let module: MainModule;

    beforeAll(async () => module = await Module());

    it("converts JS array to a C++ IntArray instance", () => {
        const jsArray = [10, 20, 30];
        const cppArray = jsArrayToCppIntArray(module, jsArray);

        try {
            expect(cppArray.size()).toBe(3);
            expect(cppArray.get(0)).toBe(10);
            expect(cppArray.get(2)).toBe(30);
        }
        finally {
            cppArray.delete();
        }
    });

    it("converts complex nested structures to C++", () => {
        const concepts: Array<FormalConcept> = [
            {
                index: 0,
                attributes: [1, 2],
                objects: [5, 6]
            }
        ];

        const cppArray = jsArrayToCppSimpleFormalConceptArray(module, concepts);

        try {
            expect(cppArray.size()).toBe(1);

            const first = cppArray.get(0)!;
            expect(first.attributes.size()).toBe(2);
            expect(first.attributes.get(1)).toBe(2);
        }
        finally {
            cppArray.delete();
        }
    });

    it("jsArrayToCppUIntArray should create a valid C++ UIntArray", () => {
        const input = [1, 2, 3];
        const cppArray = jsArrayToCppUIntArray(module, input);

        try {
            expect(cppArray.size()).toBe(3);
            expect(cppArray.get(1)).toBe(2);
        }
        finally {
            cppArray.delete();
        }
    });

    it("converts C++ StringArray back to JS using a generator", () => {
        const cppArray = new module.StringArray();
        cppArray.push_back("Hello");
        cppArray.push_back("WASM");

        const result = [...cppStringArrayToJs(cppArray, true)];
        expect(result).toEqual(["Hello", "WASM"]);
    });

    it("correctly maps WASM memory to a JS Float32Array", () => {
        const cppArray = new module.FloatArray();
        cppArray.push_back(1.5);
        cppArray.push_back(2.5);

        const result = cppFloatArrayToFloat32Array(cppArray, module, true);
        expect(result).toBeInstanceOf(Float32Array);
        expect(result[0]).toBe(1.5);
        expect(result[1]).toBe(2.5);
    });

    it("cppUIntArrayToJs should yield values from UIntArray", () => {
        const cppArray = new module.UIntArray();
        cppArray.push_back(100);
        cppArray.push_back(200);

        const result = [...cppUIntArrayToJs(cppArray, true)];
        expect(result).toEqual([100, 200]);
    });

    it("cppIntArrayToJs should yield values from IntArray", () => {
        const cppArray = new module.IntArray();
        cppArray.push_back(-1);
        cppArray.push_back(42);

        const result = [...cppIntArrayToJs(cppArray, true)];
        expect(result).toEqual([-1, 42]);
    });

    it("cppIntMultiArrayToJs should handle nested IntArrays", () => {
        const outer = new module.IntMultiArray();
        const inner1 = new module.IntArray();
        inner1.push_back(1);
        const inner2 = new module.IntArray();
        inner2.push_back(2);
        inner2.push_back(3);
        outer.push_back(inner1);
        outer.push_back(inner2);

        const result = [...cppIntMultiArrayToJs(outer, true)];
        expect(result).toEqual([[1], [2, 3]]);
    });

    it("cppFormalConceptArrayToJs should yield mapped FormalConcept objects", () => {
        const conceptArray = new module.FormalConceptArray();
        const concept = new module.FormalConcept();
        const attributes = new module.IntArray();
        const objects = new module.IntArray();

        // Setup internal arrays
        attributes.push_back(7);
        objects.push_back(8);
        objects.push_back(9);
        concept.objects = objects;
        concept.attributes = attributes;
        conceptArray.push_back(concept);
        conceptArray.push_back(new module.FormalConcept());

        const result = [...cppFormalConceptArrayToJs(conceptArray, true)];
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            index: 0,
            attributes: [7],
            objects: [8, 9]
        });
    });

    it("cppFloatArrayToPoints should convert flat floats to [x, y, z] points", () => {
        const cppArray = new module.FloatArray();
        const data = [1.0, 2.0, 3.0, 10.0, 20.0, 30.0];
        data.forEach(v => cppArray.push_back(v));

        const result = cppFloatArrayToPoints(cppArray, 2, true);
        expect(result).toEqual([
            [1.0, 2.0, 3.0],
            [10.0, 20.0, 30.0]
        ]);
    });
});