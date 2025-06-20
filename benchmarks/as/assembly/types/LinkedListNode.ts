export class LinkedListNode<T> {
    value!: T;
    next: LinkedListNode<T> | null = null;
    previous: LinkedListNode<T> | null = null;
}