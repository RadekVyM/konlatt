import { expect, test, describe } from "vitest";
import { __collect, inCloseBurmeister } from "../..";
import { DIGITS, LATTICE, LIVEINWATER, TEALADY, TestValue } from "../testValues";

describe.each<TestValue>([
    DIGITS,
    LATTICE,
    LIVEINWATER,
    TEALADY,
])("inClose", (value: any) => {
    test(`inClose on ${value.title}`, () => {
        const concepts = inCloseBurmeister(value.fileContent).value;
        __collect();
        expect(concepts.length).toBe(value.conceptsCount);
    }, 60000);
});