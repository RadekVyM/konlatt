/**
 * Sequentially applies the provided `with*` transformations to a state object.
 * @param newState 
 * @param oldState 
 * @param withTransformations - `with*` transformations. `undefined` values are skipped.
 * @returns Transformed state
 */
export function w<T>(
    newState: Partial<T>,
    oldState: T,
    ...withTransformations: (((newState: Partial<T>, oldState: T) => Partial<T>) | undefined)[]
): Partial<T> {
    let result: Partial<T> = newState;

    for (const withFunc of withTransformations) {
        if (!withFunc) {
            continue;
        }
        
        result = withFunc(result, oldState);
    }

    return result;
}

/**
 * Returns the provided value if it is defined, otherwise returns the fallback.
 * @param value - The value to check for `undefined`.
 * @param fallback - The value to return if `value` is `undefined`.
 * @returns The original value or the fallback.
 */
export function withFallback<T>(value: T | undefined, fallback: T): T {
    return value === undefined ? fallback : value;
}