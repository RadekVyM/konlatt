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
    ...withTransformations: ((newState: Partial<T>, oldState: T) => Partial<T>)[]
): Partial<T> {
    let result: Partial<T> = newState;

    for (const withFunc of withTransformations) {
        result = withFunc(result, oldState);
    }

    return result;
}