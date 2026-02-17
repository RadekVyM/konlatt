import { describe, it, expect } from "vitest";
import { w, withFallback } from "../../src/utils/stores";

describe("w()", () => {
    type State = {
        count: number,
        text: string,
    }

    it("should apply transformations sequentially", () => {
        const oldState: State = { count: 0, text: "old" };
        const newState: Partial<State> = { count: 1 };

        const withAddedText = (newState: Partial<State>) =>
            ({ ...newState, text: "updated" });
        const withDoubleCount = (newState: Partial<State>) =>
            ({ ...newState, count: withFallback(newState.count, oldState.count) * 2 });

        const result = w(newState, oldState, withAddedText, withDoubleCount);

        expect(result).toEqual({ count: 2, text: "updated" });
    });

    it("should skip undefined transformations", () => {
        const oldState = { value: 10 };
        type OldState = typeof oldState
        const withTransformation = (newState: Partial<OldState>, oldState: OldState) =>
            ({ value: withFallback(newState.value, oldState.value) + 1 });

        const result = w({ value: 1 }, oldState, undefined, withTransformation, undefined);

        expect(result).toEqual({ value: 2 });
    });

    it("should return the original newState if no transformations are provided", () => {
        const state = { a: 1 };
        expect(w(state, state)).toBe(state);
    });
});

describe("withFallback()", () => {
    it("should return the value if it is defined", () => {
        expect(withFallback("hello", "fallback")).toBe("hello");
        expect(withFallback(0, 10)).toBe(0);
        expect(withFallback(false, true)).toBe(false);
        expect(withFallback(null, "fallback")).toBe(null);
    });

    it("should return the fallback if the value is undefined", () => {
        expect(withFallback(undefined, "fallback")).toBe("fallback");
    });
});