import { expect, test } from "vitest";
import Module from "../../../src/cpp";
import { DIGITS, LATTICE, LIVEINWATER, TEALADY, TestValue } from "../../constants/flowTestValues";
import { cppFormalConceptArrayToJs, cppIntMultiArrayToJs, jsArrayToCppIndexedFormalConceptArray } from "../../../src/utils/cpp";

test.each<TestValue>([
    DIGITS,
    LATTICE,
    LIVEINWATER,
    TEALADY,
    //NOM5SHUTTLE,
])("concepts cover", async (value) => {
    const module = await Module();
    const context = module.parseBurmeister(value.fileContent);
    const concepts = module.inClose(context.context, context.cellSize, context.cellsPerObject, context.objects.size(), context.attributes.size(), undefined);
    const { value: result } = module.conceptsCover(
        jsArrayToCppIndexedFormalConceptArray(module, [...cppFormalConceptArrayToJs(concepts.value, true)]),
        context.context,
        context.cellSize,
        context.cellsPerObject,
        context.objects.size(),
        context.attributes.size(),
        undefined
    );
    const lattice = [...cppIntMultiArrayToJs(result, true)];
    expect(lattice.reduce((prev, curr) => prev + curr.length, 0))
        .toBe(value.coverRelationSize);

    context.delete();
}, 60000);