export function hashString(str: string) {
    // https://stackoverflow.com/a/8831937
    let hash = 0;

    if (str.length === 0) {
        return hash;
    }

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Ensure 32-bit integer
    }
    // Convert to unsigned 32-bit integer to ensure positive
    return hash >>> 0;
}

export function generateRandomSeed(length: number) {
    const random = Math.random();
    return Math.round(random * Math.pow(10, length)).toString().padStart(length, "0");
}

export function isNullOrWhiteSpace(str: string | null | undefined) {
    return str === null || str === undefined || str.trim().length === 0;
}