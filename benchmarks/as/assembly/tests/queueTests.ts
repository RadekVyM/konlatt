import { createQueue, dequeue, enqueue, isQueueEmpty } from "../structures/queue";

export function queueTest(): boolean {
    const queue = createQueue<i32>();

    if (!isQueueEmpty(queue)) {
        return false;
    }

    enqueue<i32>(queue, 0);
    enqueue<i32>(queue, 1);
    enqueue<i32>(queue, 2);

    if (isQueueEmpty(queue)) {
        return false;
    }

    if (dequeue<i32>(queue, -1) !== 0) {
        return false;
    }
    if (dequeue<i32>(queue, -1) !== 1) {
        return false;
    }

    enqueue<i32>(queue, 3);

    if (dequeue<i32>(queue, -1) !== 2) {
        return false;
    }
    if (dequeue<i32>(queue, -1) !== 3) {
        return false;
    }

    if (!isQueueEmpty(queue)) {
        return false;
    }

    return true;
}