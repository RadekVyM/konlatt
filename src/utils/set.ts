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