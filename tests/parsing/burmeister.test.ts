import { expect, test } from "vitest";
import { __collect, parseBurmeister } from "../../src/as";
import { RawFormalContext } from "../../src/types/RawFormalContext";
import nom10crx from "../../datasets/nom10crx.cxt?raw";
import digits from "../../datasets/digits.cxt?raw";
import mushroomep from "../../datasets/mushroomep.cxt?raw";

const DIGITS_CONTEXT = [
    0b1111101n,
    0b1100000n,
    0b0110111n,
    0b1100111n,
    0b1101010n,
    0b1001111n,
    0b1011110n,
    0b1100001n,
    0b1111111n,
    0b1101011n,
];
const DIGITS_OBJECTS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DIGITS_ATTRIBUTES = ["a", "b", "c", "d", "e", "f", "g"];
const DIGITS_CELLS_PER_OBJECT = 1;

test("digits context is parsed correctly", () => {
    const context = parseBurmeister(digits) as RawFormalContext;
    __collect();

    expect(context.context).toEqual(DIGITS_CONTEXT);
    expect(context.objects).toEqual(DIGITS_OBJECTS);
    expect(context.attributes).toEqual(DIGITS_ATTRIBUTES);
    expect(context.cellsPerObject).toBe(DIGITS_CELLS_PER_OBJECT);
});

test("nom10crx context is parsed", () => {
    const context = parseBurmeister(nom10crx) as RawFormalContext;
    __collect();

    expect(context.context.length > 0).toBe(true);
    expect(context.objects.length).toBe(653);
    expect(context.attributes.length).toBe(85);
    expect(context.cellsPerObject).toBe(2);
});

test("mushroomep context is parsed", () => {
    const context = parseBurmeister(mushroomep) as RawFormalContext;
    __collect();

    expect(context.context.length > 0).toBe(true);
    expect(context.objects.length).toBe(8124);
    expect(context.attributes.length).toBe(126);
    expect(context.cellsPerObject).toBe(2);
});