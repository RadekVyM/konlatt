/*
//@ts-nocheck
*/

import { expect, test, describe } from "vitest";
import { __collect, inCloseBurmeister } from "../../../../src/wasm/as";
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
    test(`inClose on ${value.title}`, () => {
        const concepts = inCloseBurmeister(value.fileContent).value;
        __collect();
        expect(concepts.length).toBe(value.conceptsCount);
    }, 60000);
});