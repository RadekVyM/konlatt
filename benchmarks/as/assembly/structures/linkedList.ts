import { LinkedList } from "../types/LinkedList";
import { LinkedListNode } from "../types/LinkedListNode";

export function createLinkedList<T>(): LinkedList<T> {
    return {
        first: null,
        last: null,
    };
}

export function isLinkedListEmpty<T>(list: LinkedList<T>): boolean {
    return list.first === list.last && list.first === null;
}

export function addFirstToLinkedList<T>(list: LinkedList<T>, value: T): LinkedListNode<T> {
    const newNode = addBetweenFirstAndLast<T>(list, value);

    list.first = newNode;

    if (!list.last) {
        list.last = newNode;
    }

    return newNode;
}

export function addLastToLinkedList<T>(list: LinkedList<T>, value: T): LinkedListNode<T> {
    const newNode = addBetweenFirstAndLast<T>(list, value);

    list.last = newNode;

    if (!list.first) {
        list.first = newNode;
    }

    return newNode;
}

export function removeFirstFromLinkedList<T>(list: LinkedList<T>): void {
    const first = list.first;
    const last = list.last;
    
    if (!first) {
        return;
    }

    if (first === last) {
        list.first = null;
        list.last = null;
    }
    else {
        list.first = first.next;

        const next = first.next;
        const previous = first.previous;

        if (next)
            next.previous = first.previous;
        if (previous)
            previous.next = first.next;
    }

    first.previous = null;
    first.next = null;
}

export function removeLastFromLinkedList<T>(list: LinkedList<T>): void {
    const first = list.first;
    const last = list.last;
    
    if (!last) {
        return;
    }

    if (first === last) {
        list.first = null;
        list.last = null;
    }
    else {
        list.last = last.previous;

        const next = last.next;
        const previous = last.previous;

        if (next)
            next.previous = last.previous;
        if (previous)
            previous.next = last.next;
    }

    last.previous = null;
    last.next = null;
}

function addBetweenFirstAndLast<T>(list: LinkedList<T>, value: T): LinkedListNode<T> {
    const newNode: LinkedListNode<T> = {
        value,
        next: null,
        previous: null
    };

    const first = list.first;
    const last = list.last;

    if (first) {
        first.previous = newNode;
        newNode.next = first;
    }
    else {
        newNode.next = newNode;
    }

    if (last) {
        last.next = newNode;
        newNode.previous = last;
    }
    else {
        newNode.previous = newNode;
    }

    return newNode;
}