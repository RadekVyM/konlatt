import { expect, test } from "vitest";
import { formalContextHasAttributesTest } from "../..";
import { NOM10CRX } from "../../../../tests/constants/flowTestValues";

test("formalContextHasAttributesTest", () => {
    expect(formalContextHasAttributesTest(NOM10CRX.fileContent, 4, [0, 3])).toBe(true);
    expect(formalContextHasAttributesTest(NOM10CRX.fileContent, 5, [73, 83])).toBe(true);
    expect(formalContextHasAttributesTest(NOM10CRX.fileContent, 5, [82])).toBe(false);
});