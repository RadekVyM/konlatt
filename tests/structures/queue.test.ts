import { expect, test } from "vitest";
import { __collect, queueTest } from "../../src/as";

test("queue", () => {
    const result = queueTest();
    __collect();

    expect(result).toBe(true);
});