import { describe, it, expect, vi } from "vitest";
import { breadthFirstSearch } from "../../src/utils/graphs";

describe("breadthFirstSearch()", () => {
    it("should visit all reachable nodes in a simple linear graph", () => {
        // 0 -> 1 -> 2
        const graph = [new Set([1]), new Set([2]), new Set<number>()];
        const visitedOrder = new Array<number>();
        const work = vi.fn((index: number) => visitedOrder.push(index));

        breadthFirstSearch(0, graph, work);

        expect(work).toHaveBeenCalledTimes(3);
        expect(visitedOrder).toEqual([0, 1, 2]);
    });

    it("should visit nodes in BFS order (level by level)", () => {
        /*
             0
            / \
           1   2
           |
           3
        */
        const graph = [
            new Set([1, 2]), // 0
            new Set([3]), // 1
            new Set<number>(), // 2
            new Set<number>(), // 3
        ];
        const visitedOrder = new Array<number>();
        const work = vi.fn((index: number) => visitedOrder.push(index));

        breadthFirstSearch(0, graph, work);

        expect(work).toHaveBeenCalledTimes(4);
        expect(visitedOrder).toEqual([0, 1, 2, 3]);
    });

    it("should handle disconnected graphs by only visiting reachable nodes", () => {
        // 0 -> 1 | 2 -> 3
        const graph = [
            new Set([1]),
            new Set<number>(),
            new Set([3]),
            new Set<number>(),
        ];
        const work = vi.fn();

        breadthFirstSearch(0, graph, work);

        expect(work).toHaveBeenCalledTimes(2);
        expect(work).toHaveBeenCalledWith(0);
        expect(work).toHaveBeenCalledWith(1);
        expect(work).not.toHaveBeenCalledWith(2);
    });
});