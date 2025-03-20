import { expect, test, describe } from "vitest";
import Module from "../../../../src/wasm/cpp";
import { DIGITS, LATTICE, LIVEINWATER, TEALADY, TestValue } from "../../../constants/flowTestValues";

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
        const concepts = module.inClose(context.context, context.cellSize, context.cellsPerObject, context.objects.size(), context.attributes.size(), undefined);
        expect(concepts.value.size()).toBe(value.conceptsCount);

        context.delete();
        concepts.value.delete();
    }, 60000);
});