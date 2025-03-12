import { LinkedList } from "../types/LinkedList";
import { addLastToLinkedList, createLinkedList, isLinkedListEmpty, removeFirstFromLinkedList } from "./linkedList";

export function createQueue<T>(): LinkedList<T> {
    return createLinkedList<T>();
}

export function isQueueEmpty<T>(queue: LinkedList<T>): boolean {
    return isLinkedListEmpty<T>(queue);
}

export function enqueue<T>(queue: LinkedList<T>, value: T): void {
    addLastToLinkedList<T>(queue, value);
}

export function dequeue<T>(queue: LinkedList<T>, defaultValue: T): T {
    const last = queue.first;

    removeFirstFromLinkedList<T>(queue);

    if (last) {
        return last.value;
    }

    return defaultValue;
}