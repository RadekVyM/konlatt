import { expect, test } from "vitest";
import Module from "../../../src/cpp";
import { DIGITS, NOM10CRX, MUSHROOMEP } from "../../constants/flowTestValues";
import { cppStringArrayToJs, cppUIntArrayToJs } from "../../../src/utils/cpp";

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

test("digits context is parsed correctly", async () => {
    const module = await Module();
    const context = module.parseBurmeister(DIGITS.fileContent);

    expect([...cppUIntArrayToJs(context.context)]).toEqual(DIGITS_CONTEXT);
    expect([...cppStringArrayToJs(context.objects)]).toEqual(DIGITS_OBJECTS);
    expect([...cppStringArrayToJs(context.attributes)]).toEqual(DIGITS_ATTRIBUTES);
    expect(context.cellsPerObject).toBe(DIGITS_CELLS_PER_OBJECT);

    context.delete();
});

test("nom10crx context is parsed", async () => {
    const module = await Module();
    const context = module.parseBurmeister(NOM10CRX.fileContent);

    expect(context.context.size() > 0).toBe(true);
    expect(context.objects.size()).toBe(653);
    expect(context.attributes.size()).toBe(85);
    expect(context.cellsPerObject).toBe(3);

    context.delete();
});

test("mushroomep context is parsed", async () => {
    const module = await Module();
    const context = module.parseBurmeister(MUSHROOMEP.fileContent);

    expect(context.context.size() > 0).toBe(true);
    expect(context.objects.size()).toBe(8124);
    expect(context.attributes.size()).toBe(126);
    expect(context.cellsPerObject).toBe(4);

    context.delete();
});