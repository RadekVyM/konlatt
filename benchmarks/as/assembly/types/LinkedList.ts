import { LinkedListNode } from "./LinkedListNode";

export class LinkedList<T> {
    first: LinkedListNode<T> | null = null;
    last: LinkedListNode<T> | null = null;
}