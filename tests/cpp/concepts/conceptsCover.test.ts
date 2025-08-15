import { expect, test } from "vitest";
import Module from "../../../src/cpp";
import { DIGITS, LATTICE, LIVEINWATER, TEALADY, TestValue } from "../../constants/flowTestValues";
import { cppFormalConceptArrayToJs, cppIntMultiArrayToJs, jsArrayToCppSimpleFormalConceptArray } from "../../../src/utils/cpp";

test.each<TestValue>([
    DIGITS,
    LATTICE,
    LIVEINWATER,
    TEALADY,
    //NOM5SHUTTLE,
])("concepts cover", async (value) => {
    const module = await Module();
    const context = module.parseBurmeister(value.fileContent);
    const conceptsResult = new module.FormalConceptsTimedResult();
    module.inClose(conceptsResult, context.context, context.cellSize, context.cellsPerObject, context.objects.size(), context.attributes.size(), undefined);
    const latticeResult = new module.IntMultiArrayTimedResult();
    module.conceptsCover(
        latticeResult,
        jsArrayToCppSimpleFormalConceptArray(module, [...cppFormalConceptArrayToJs(conceptsResult.value, true)]),
        context.context,
        context.cellSize,
        context.cellsPerObject,
        context.objects.size(),
        context.attributes.size(),
        undefined
    );
    const lattice = [...cppIntMultiArrayToJs(latticeResult.value, true)];
    expect(lattice.reduce((prev, curr) => prev + curr.length, 0))
        .toBe(value.coverRelationSize);

    conceptsResult.value.delete();
    latticeResult.value.delete();

    conceptsResult.delete();
    latticeResult.delete();

    context.delete();
}, 60000);