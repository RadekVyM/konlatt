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
import { __collect, conceptsToLattice, inCloseBurmeister, inClose, parseBurmeister, conceptsCover } from "../../src/as";
import { RawFormalConcept } from "../../src/types/RawFormalConcept";

const DIGITS_CONCEPTS_COUNT = 48;
const NOM10CRX_CONCEPTS_COUNT = 51078;
const NOM10SHUTTLE_CONCEPTS_COUNT = 2931;
const NOM5SHUTTLE_CONCEPTS_COUNT = 1461;
const LATTICE_CONCEPTS_COUNT = 24;
const LIVEINWATER_CONCEPTS_COUNT = 19;
const TEALADY_CONCEPTS_COUNT = 65;
const MUSHROOMEP_CONCEPTS_COUNT = 233116;

test("inClose on digits", () => {
    const context = parseBurmeister(digits);
    __collect();

    const concepts = inClose(context) as Array<RawFormalConcept>;
    __collect();
    
    const lattice1 = conceptsToLattice(concepts);
    __collect();

    const lattice2 = conceptsCover(concepts, context);
    __collect();

    console.log(latticeSize(lattice1));
    console.log(latticeSize(lattice2));

    expect(concepts.length).toBe(DIGITS_CONCEPTS_COUNT);
});
test("inClose on nom10crx", () => {
    const concepts = inCloseBurmeister(nom10crx) as Array<RawFormalConcept>;
    __collect();
    
    /*
    const resultLattice = conceptsToLattice(concepts);
    __collect();

    console.log(latticeSize(resultLattice));
    */

    expect(concepts.length).toBe(NOM10CRX_CONCEPTS_COUNT);
});

test("inClose on nom10shuttle", () => {
    const context = parseBurmeister(nom10shuttle);
    __collect();

    const concepts = inClose(context) as Array<RawFormalConcept>;
    __collect();
    
    const lattice1 = conceptsToLattice(concepts);
    __collect();
    console.log(latticeSize(lattice1));

    /*
    const lattice2 = conceptsCover(concepts, context);
    __collect();
    console.log(latticeSize(lattice2));
    */

    expect(concepts.length).toBe(NOM10SHUTTLE_CONCEPTS_COUNT);
}, 60000);
    
test("inClose on nom5shuttle", () => {
    const context = parseBurmeister(nom5shuttle);
    __collect();

    const concepts = inClose(context) as Array<RawFormalConcept>;
    __collect();
    
    const lattice1 = conceptsToLattice(concepts);
    __collect();
    console.log(latticeSize(lattice1));

    /*
    const lattice2 = conceptsCover(concepts, context);
    __collect();
    console.log(latticeSize(lattice2));
    */

    expect(concepts.length).toBe(NOM5SHUTTLE_CONCEPTS_COUNT);
}, 60000);

test("inClose on liveinwater", () => {
    const concepts = inCloseBurmeister(liveinwater) as Array<RawFormalConcept>;
    __collect();
    
    const lattice = conceptsToLattice(concepts);
    __collect();

    console.log(latticeSize(lattice));

    expect(concepts.length).toBe(LIVEINWATER_CONCEPTS_COUNT);
});

test("inClose on lattice", () => {
    const concepts = inCloseBurmeister(lattice) as Array<RawFormalConcept>;
    __collect();
    
    const resultLattice = conceptsToLattice(concepts);
    __collect();

    console.log(latticeSize(resultLattice));

    expect(concepts.length).toBe(LATTICE_CONCEPTS_COUNT);
});

test("inClose on tealady", () => {
    const concepts = inCloseBurmeister(tealady) as Array<RawFormalConcept>;
    __collect();
    
    const lattice = conceptsToLattice(concepts);
    __collect();

    console.log(latticeSize(lattice));

    expect(concepts.length).toBe(TEALADY_CONCEPTS_COUNT);
});


function latticeSize(lattice: number[][]): number {
    return lattice.reduce((prev, curr) => prev + curr.length, 0);
}

/*
test("inClose on mushroomep", () => {
    const concepts = inCloseBurmeister(mushroomep) as Array<RawFormalConcept>;
    __collect();
    expect(concepts.length).toBe(MUSHROOMEP_CONCEPTS_COUNT);
}, 60000);
*/