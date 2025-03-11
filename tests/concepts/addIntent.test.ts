//@ts-nocheck

import { expect, test, describe } from "vitest";
import { __collect, __Record14, addIntent, parseBurmeister } from "../../src/as";
import { RawFormalContext } from "../../src/types/RawFormalContext";
import { DIGITS, LATTICE, LIVEINWATER, NOM5SHUTTLE, TEALADY, MUSHROOMEP, TestValue } from "../constants/flowTestValues";

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
        expect(latticeSize(lattice)).toBe(value.coverRelationSize);
    }, 60000);
});

function latticeSize(lattice: __Record14<never>): number {
    return lattice.coverageRelation.reduce((prev, curr) => prev + curr.length, 0);
}