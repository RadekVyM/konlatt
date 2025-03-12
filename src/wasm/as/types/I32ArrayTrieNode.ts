export class I32ArrayTrieNode {
    children: Map<i32, I32ArrayTrieNode> = new Map<i32, I32ArrayTrieNode>();
    isTerminal: boolean = false;
    index: i32 = -1;
}