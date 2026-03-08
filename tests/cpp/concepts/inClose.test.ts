import { expect, test, describe } from "vitest";
import Module from "../../../src/cpp";
import { DIGITS, LATTICE, LIVEINWATER, TEALADY, TestValue } from "../../constants/flowTestValues";
import parseBurmeister from "../../../src/services/parsing/burmeister";
import { jsArrayToCppUIntArray } from "../../../src/utils/cpp";

describe.each<TestValue>([
    DIGITS,
    LATTICE,
    LIVEINWATER,
    TEALADY,
    //NOM10SHUTTLE,
    //NOM5SHUTTLE,
    //NOM10CRX,
    //MUSHROOMEP,
])("inClose", (value) => {
    test(`inClose on ${value.title}`, async () => {
        const module = await Module();
        const context = parseBurmeister(value.fileContent);
        const uIntContext = jsArrayToCppUIntArray(module, context.relation);
        const result = new module.FormalConceptsTimedResult();
        module.inClose(result, uIntContext, context.cellSize, context.cellsPerObject, context.objects.length, context.attributes.length, undefined);
        expect(result.value.size()).toBe(value.conceptsCount);

        uIntContext.delete();
        result.value.delete();
        result.delete();
    }, 60000);
});