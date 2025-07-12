export function createRange(length: number) {
    const numbers = new Array<number>(length);

    for (let i = 0; i < length; i++) {
        numbers[i] = i;
    }

    return numbers;
}