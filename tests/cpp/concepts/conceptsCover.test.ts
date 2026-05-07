import { describe, expect, it } from "vitest";
import Module from "../../../src/cpp";
import { DIGITS, LATTICE, LIVEINWATER, TEALADY, TestValue } from "../../constants/flowTestValues";
import { cppFormalConceptArrayToJs, cppIntMultiArrayToJs, jsArrayToCppSimpleFormalConceptArray, jsArrayToCppUIntArray } from "../../../src/utils/cpp";
import parseBurmeister from "../../../src/services/parsing/burmeister";

describe.each<TestValue>([
    DIGITS,
    LATTICE,
    LIVEINWATER,
    TEALADY,
    //NOM5SHUTTLE,
])("conceptsCover()", (value) => {
    it(`should run successfully and return a lattice of ${value.title} of the correct size`, async () => {
        const module = await Module();
        const context = parseBurmeister(value.fileContent);
        const uIntContext = jsArrayToCppUIntArray(module, context.relation);
        const conceptsResult = new module.FormalConceptsTimedResult();
        module.inClose(conceptsResult, uIntContext, context.cellSize, context.cellsPerObject, context.objects.length, context.attributes.length, undefined);
        const latticeResult = new module.IntMultiArrayTimedResult();
        module.conceptsCover(
            latticeResult,
            jsArrayToCppSimpleFormalConceptArray(module, [...cppFormalConceptArrayToJs(conceptsResult.value, true)]),
            uIntContext,
            context.cellSize,
            context.cellsPerObject,
            context.objects.length,
            context.attributes.length,
            undefined
        );
        const lattice = [...cppIntMultiArrayToJs(latticeResult.value, true)];

        expect(lattice.reduce((prev, curr) => prev + curr.length, 0))
            .toBe(value.coverRelationSize);

        conceptsResult.value.delete();
        latticeResult.value.delete();

        conceptsResult.delete();
        latticeResult.delete();

        uIntContext.delete();
    });
}, 60000);