/**
 * Compares two sets for equality by checking size and element presence.
 */
export function areSetsEqual<T>(first: ReadonlySet<T>, second: ReadonlySet<T>) {
    if (first.size !== second.size) {
        return false;
    }

    for (const value of first) {
        if (!second.has(value)) {
            return false;
        }
    }

    return true;
}

/**
 * Determines if an array contains the exact same unique elements as a set.
 * Note: Assumes the array has no duplicates for a valid equality check.
 */
export function areArraySetEqual<T>(first: ReadonlyArray<T>, second: ReadonlySet<T>) {
    if (first.length !== second.size) {
        return false;
    }

    for (const value of first) {
        if (!second.has(value)) {
            return false;
        }
    }

    return true;
}