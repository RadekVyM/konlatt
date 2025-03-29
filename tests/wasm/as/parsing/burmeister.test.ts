import { expect, test } from "vitest";
import { __collect, parseBurmeister } from "../../../../src/wasm/as";
import { FormalContext } from "../../../../src/types/FormalContext";
import { DIGITS, NOM10CRX, MUSHROOMEP } from "../../../constants/flowTestValues";

const DIGITS_CONTEXT = [
    0b1111101,
    0b1100000,
    0b0110111,
    0b1100111,
    0b1101010,
    0b1001111,
    0b1011110,
    0b1100001,
    0b1111111,
    0b1101011,
];
const DIGITS_OBJECTS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DIGITS_ATTRIBUTES = ["a", "b", "c", "d", "e", "f", "g"];
const DIGITS_CELLS_PER_OBJECT = 1;

test("digits context is parsed correctly", () => {
    const context = parseBurmeister(DIGITS.fileContent) as FormalContext;
    __collect();

    expect(context.context).toEqual(DIGITS_CONTEXT);
    expect(context.objects).toEqual(DIGITS_OBJECTS);
    expect(context.attributes).toEqual(DIGITS_ATTRIBUTES);
    expect(context.cellsPerObject).toBe(DIGITS_CELLS_PER_OBJECT);
});

test("nom10crx context is parsed", () => {
    const context = parseBurmeister(NOM10CRX.fileContent) as FormalContext;
    __collect();

    expect(context.context.length > 0).toBe(true);
    expect(context.objects.length).toBe(653);
    expect(context.attributes.length).toBe(85);
    expect(context.cellsPerObject).toBe(3);
});

test("mushroomep context is parsed", () => {
    const context = parseBurmeister(MUSHROOMEP.fileContent) as FormalContext;
    __collect();

    expect(context.context.length > 0).toBe(true);
    expect(context.objects.length).toBe(8124);
    expect(context.attributes.length).toBe(126);
    expect(context.cellsPerObject).toBe(4);
});