import { addFirstToLinkedList, addLastToLinkedList, createLinkedList, isLinkedListEmpty, removeFirstFromLinkedList, removeLastFromLinkedList } from "../structures/linkedList";
import { LinkedList } from "../types/LinkedList";

export function linkedListTest(): boolean {
    const list = createLinkedList<i32>();

    if (!isLinkedListEmpty(list)) {
        return false;
    }

    addFirstToLinkedList(list, 0);
    addFirstToLinkedList(list, 1);
    addFirstToLinkedList(list, 2);

    if (!containsItems<i32>(list, [2, 1, 0])) {
        return false;
    }

    addLastToLinkedList(list, 3);
    addLastToLinkedList(list, 4);

    if (!containsItems<i32>(list, [2, 1, 0, 3, 4])) {
        return false;
    }

    removeFirstFromLinkedList(list);

    if (!containsItems<i32>(list, [1, 0, 3, 4])) {
        return false;
    }

    removeLastFromLinkedList(list);

    if (!containsItems<i32>(list, [1, 0, 3])) {
        return false;
    }

    removeLastFromLinkedList(list);
    removeFirstFromLinkedList(list);

    if (!containsItems<i32>(list, [0])) {
        return false;
    }

    removeFirstFromLinkedList(list);

    if (!isLinkedListEmpty(list)) {
        return false;
    }

    return true;
}

function containsItems<T>(list: LinkedList<T>, items: Array<T>): boolean {
    let current = list.first;
    
    for (let i = 0; i < items.length; i++) {
        if (!current || current.value !== items[i]) {
            return false;
        }

        current = current.next;
    }

    return true;
}