/**
 * Creates an array of a specified length containing a sequence of numbers starting from 0.
 * @param length - The number of elements to generate.
 * @returns An array of numbers from 0 up to length - 1.
 */
export function createRange(length: number) {
    const numbers = new Array<number>(length);

    for (let i = 0; i < length; i++) {
        numbers[i] = i;
    }

    return numbers;
}

/**
 * Mutates an existing array by replacing all of its elements with a specific value.
 * @param array - The array to be modified.
 * @param value - The value to populate the array with.
 */
export function fillWith<T>(array: Array<T>, value: T) {
    for (let i = 0; i < array.length; i++) {
        array[i] = value;
    }
}

/**
 * Calculates the total length of all strings in an array, with an optional extra value added to each.
 * @param stringArray - The array of strings to measure.
 * @param addition - An optional constant to add to the length of each string (defaults to 0).
 * @returns The cumulative sum of lengths and additions.
 */
export function sumLengths(stringArray: Array<string>, addition: number = 0) {
    return stringArray.reduce((prev, current) => prev + current.length + addition, 0);
}