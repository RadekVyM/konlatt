import { expect, test } from "vitest";
import { __collect, queueTest } from "../..";

test("queue", () => {
    const result = queueTest();
    __collect();

    expect(result).toBe(true);
});