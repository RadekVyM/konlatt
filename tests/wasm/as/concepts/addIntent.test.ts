import { expect, test, describe } from "vitest";
import { __collect, addIntent, parseBurmeister } from "../../../../src/wasm/as";
import { RawFormalContext } from "../../../../src/types/RawFormalContext";
import { DIGITS, LATTICE, LIVEINWATER, TEALADY, TestValue } from "../../../constants/flowTestValues";

describe.each<TestValue>([
    DIGITS,
    LATTICE,
    LIVEINWATER,
    TEALADY,
    //MUSHROOMEP,
    //NOM5SHUTTLE,
])("addIntent", (value) => {
    test(`addIntent on ${value.title}`, () => {
        const context = parseBurmeister(value.fileContent) as RawFormalContext;
        const lattice = addIntent(context);
        __collect();

        expect(lattice.formalConcepts.length).toBe(value.conceptsCount);
        expect(lattice.coverageRelation.reduce((prev, curr) => prev + curr.length, 0)).toBe(value.coverRelationSize);
    }, 60000);
});