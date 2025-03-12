import { expect, test } from "vitest";
import { __collect, objectTrieTest } from "../../../../src/wasm/as";

test("trie", () => {
    const result = objectTrieTest();
    __collect();

    expect(result).toBe(true);
});