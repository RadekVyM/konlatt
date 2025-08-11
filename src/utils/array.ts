export function createRange(length: number) {
    const numbers = new Array<number>(length);

    for (let i = 0; i < length; i++) {
        numbers[i] = i;
    }

    return numbers;
}

export function sumLengths(stringArray: Array<string>) {
    return stringArray.reduce((prev, current) => prev + current.length + 1, 0);
}