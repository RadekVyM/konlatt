import { expect, test } from "vitest";
import { formalContextHasAttributesTest } from "../../src/as";
import nom10crx from "../../datasets/nom10crx.cxt?raw";

test("formalContextHasAttributesTest", () => {
    expect(formalContextHasAttributesTest(nom10crx, 4, [0, 3])).toBe(true);
    expect(formalContextHasAttributesTest(nom10crx, 5, [73, 83])).toBe(true);
    expect(formalContextHasAttributesTest(nom10crx, 5, [82])).toBe(false);
});