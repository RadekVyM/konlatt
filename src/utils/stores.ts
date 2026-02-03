/**
 * Applies the provided `with*` transformations to the state.
 * @param newState 
 * @param oldState 
 * @param withTransformations `with*` transformations
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

export function withFallback<T>(value: T | undefined, fallback: T): T {
    return value === undefined ? fallback : value;
}