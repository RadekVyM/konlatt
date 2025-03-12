import { createObjectTrie, find } from "../structures/trie";
import { IndexedFormalConcept } from "../types/FormalConcept";

export function objectTrieTest(): boolean {
    const concepts: Array<IndexedFormalConcept> = [
        {
            index: 0,
            objects: [],
            attributes: [1, 2, 3],
        },
        {
            index: 1,
            objects: [1, 2, 3],
            attributes: [2, 3],
        },
        {
            index: 2,
            objects: [2, 3],
            attributes: [1, 2],
        },
        {
            index: 3,
            objects: [1, 3],
            attributes: [2],
        },
        {
            index: 4,
            objects: [2, 4, 3],
            attributes: [1],
        },
        {
            index: 5,
            objects: [2, 3, 4, 5],
            attributes: [4],
        },
    ];

    const trie = createObjectTrie(concepts);

    if (find(trie, [], 0) !== 0) {
        return false;
    }

    if (find(trie, [1, 2, 3], 3) !== 1) {
        return false;
    }

    if (find(trie, [2, 3], 2) !== 2) {
        return false;
    }

    if (find(trie, [1, 3], 2) !== 3) {
        return false;
    }

    if (find(trie, [2, 4, 3], 3) !== 4) {
        return false;
    }

    if (find(trie, [2, 3, 4, 5], 4) !== 5) {
        return false;
    }

    return true;
}