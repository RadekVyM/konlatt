//@ts-nocheck

import { expect, test } from "vitest";
import digits from "../../datasets/digits.cxt?raw";
import nom10crx from "../../datasets/nom10crx.cxt?raw";
import nom10shuttle from "../../datasets/nom10shuttle.cxt?raw";
import nom5shuttle from "../../datasets/nom5shuttle.cxt?raw";
import lattice from "../../datasets/lattice.cxt?raw";
import liveinwater from "../../datasets/liveinwater.cxt?raw";
import tealady from "../../datasets/tealady.cxt?raw";
import mushroomep from "../../datasets/mushroomep.cxt?raw";
import { __collect, __Record14, addIntent, parseBurmeister } from "../../src/as";
import { RawFormalContext } from "../../src/types/RawFormalContext";

const DIGITS_CONCEPTS_COUNT = 48;
const NOM10CRX_CONCEPTS_COUNT = 51078;
const NOM10SHUTTLE_CONCEPTS_COUNT = 2931;
const NOM5SHUTTLE_CONCEPTS_COUNT = 1461;
const LATTICE_CONCEPTS_COUNT = 24;
const LIVEINWATER_CONCEPTS_COUNT = 19;
const TEALADY_CONCEPTS_COUNT = 65;
const MUSHROOMEP_CONCEPTS_COUNT = 233116;

test("addIntent on digits", () => {
    const context = parseBurmeister(digits) as RawFormalContext;
    const lattice = addIntent(context);
    __collect();
    
    console.log(latticeSize(lattice));

    expect(lattice.formalConcepts.length).toBe(DIGITS_CONCEPTS_COUNT);
});

test("addIntent on lattice", () => {
    const context = parseBurmeister(lattice) as RawFormalContext;
    const resultLattice = addIntent(context);
    __collect();

    console.log(latticeSize(resultLattice));

    expect(resultLattice.formalConcepts.length).toBe(LATTICE_CONCEPTS_COUNT);
});

test("addIntent on liveinwater", () => {
    const context = parseBurmeister(liveinwater) as RawFormalContext;
    const lattice = addIntent(context);
    __collect();

    console.log(latticeSize(lattice));

    expect(lattice.formalConcepts.length).toBe(LIVEINWATER_CONCEPTS_COUNT);
});

test("addIntent on tealady", () => {
    const context = parseBurmeister(tealady) as RawFormalContext;
    const lattice = addIntent(context);
    __collect();
    
    console.log(latticeSize(lattice));

    expect(lattice.formalConcepts.length).toBe(TEALADY_CONCEPTS_COUNT);
});


function latticeSize(lattice: __Record14<never>): number {
    return lattice.coverageRelation.reduce((prev, curr) => prev + curr.length, 0);
}

/*
test("addIntent on nom10crx", () => {
    const context = parseBurmeister(nom10crx) as RawFormalContext;
    const lattice = addIntent(context);
    __collect();
    expect(lattice.formalConcepts.length).toBe(NOM10CRX_CONCEPTS_COUNT);
});

test("addIntent on nom5shuttle", () => {
    const context = parseBurmeister(nom5shuttle) as RawFormalContext;
    const lattice = addIntent(context);
    __collect();
    expect(lattice.formalConcepts.length).toBe(NOM5SHUTTLE_CONCEPTS_COUNT);
}, 60000);

test("addIntent on nom10shuttle", () => {
    const context = parseBurmeister(nom10shuttle) as RawFormalContext;
    const lattice = addIntent(context);
    __collect();
    expect(lattice.formalConcepts.length).toBe(NOM10SHUTTLE_CONCEPTS_COUNT);
}, 60000);

test("addIntent on mushroomep", () => {
    const context = parseBurmeister(mushroomep) as RawFormalContext;
    const lattice = addIntent(context);
    __collect();
    expect(lattice.formalConcepts.length).toBe(MUSHROOMEP_CONCEPTS_COUNT);
}, 60000);
*/