import { expect, test, describe } from "vitest";
import Module from "../../../src/cpp";
import { DIGITS, LATTICE, LIVEINWATER, TEALADY, TestValue } from "../../constants/flowTestValues";

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
        const context = module.parseBurmeister(value.fileContent);
        const result = new module.FormalConceptsTimedResult();
        module.inClose(result, context.context, context.cellSize, context.cellsPerObject, context.objects.size(), context.attributes.size(), undefined);
        expect(result.value.size()).toBe(value.conceptsCount);

        context.delete();
        result.value.delete();
        result.delete();
    }, 60000);
});