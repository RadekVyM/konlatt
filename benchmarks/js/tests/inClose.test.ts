import { expect, test, describe } from "vitest";
import { inClose } from "../inClose";
import { DIGITS, LATTICE, LIVEINWATER, TEALADY, TestValue } from "./testValues";
import parseBurmeister from "../../../src/services/parsing/burmeister";

describe.each<TestValue>([
    DIGITS,
    LATTICE,
    LIVEINWATER,
    TEALADY,
])("inClose", (value: TestValue) => {
    test(`inClose on ${value.title}`, () => {
        const context = parseBurmeister(value.fileContent);
        const concepts = inClose(context).value;
        expect(context.cellsPerObject).toBe(value.contextCellsPerObject);
        expect(context.objects.length).toBe(value.objectsCount);
        expect(context.attributes.length).toBe(value.attributesCount);
        expect(concepts.length).toBe(value.conceptsCount);
    }, 60000);
});