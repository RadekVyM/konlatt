import { expect, test } from "vitest";
import { __collect, linkedListTest } from "../../src/as";

test("linkedList", () => {
    const result = linkedListTest();
    __collect();

    expect(result).toBe(true);
});