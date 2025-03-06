import { IndexedFormalConcept } from "../types/FormalConcept";
import { I32ArrayTrieNode } from "../types/I32ArrayTrieNode";

export function createObjectTrie(concepts: Array<IndexedFormalConcept>): I32ArrayTrieNode {
    const trie = createI32TrieNode();

    for (let i = 0; i < concepts.length; i++) {
        const concept = concepts[i];
        instertI32TrieNode(trie, concept.objects, i);
    }

    return trie;
}

export function find(trie: I32ArrayTrieNode, array: StaticArray<i32>, length: i32): i32 {
    for (let i = 0; i < length; i++) {
        const key = array[i];

        if (!trie.children.has(key)) {
            return -1;
        }

        trie = trie.children.get(key);
    }

    return trie.index;
}

function createI32TrieNode(): I32ArrayTrieNode {
    const node: I32ArrayTrieNode = {
        children: new Map<i32, I32ArrayTrieNode>(),
        isTerminal: false,
        index: -1,
    };

    return node;
}

function instertI32TrieNode(trie: I32ArrayTrieNode, array: StaticArray<i32>, index: i32): void {
    for (let i = 0; i < array.length; i++) {
        const key = array[i];
        let node: I32ArrayTrieNode;

        if (!trie.children.has(key)) {
            node = createI32TrieNode();
            trie.children.set(key, node);
        }
        else {
            node = trie.children.get(key);
        }

        trie = node;
    }

    trie.index = index;
    trie.isTerminal = true;
}