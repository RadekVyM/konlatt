/**
 * Generates a 32-bit unsigned integer hash from a string.
 */
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

/**
 * Generates a numeric random seed string of a specific length.
 * @param length The number of digits in the seed.
 */
export function generateRandomSeed(length: number) {
    const random = Math.random();
    return Math.round(random * Math.pow(10, length)).toString().padStart(length, "0");
}

/**
 * Checks if a string is null, undefined, or consists only of whitespace.
 */
export function isNullOrWhiteSpace(str: string | null | undefined) {
    return str === null || str === undefined || str.trim().length === 0;
}

/**
 * Escapes backslashes and double quotes for inclusion in a JSON string.
 */
export function escapeJson(str: string) {
    return str
        .replace(/\\/g, "\\\\")
        .replace(/"/g, `\\"`);

    /*
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/\b/g, "\\b")
    */
}

/**
 * Reverses JSON character escaping for backslashes and double quotes.
 */
export function unescapeJson(str: string) {
    return str
        .replace(/\\"/g, `"`)
        .replace(/\\\\/g, "\\");

    /*
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\f/g, "\f")
    .replace(/\\b/g, "\b")
    */
}

/**
 * Escapes special XML/HTML characters (&, <, >, ", ').
 */
export function escapeXml(str: string) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Converts XML entities back to their literal characters.
 */
export function unescapeXml(str: string) {
    return str.replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, `"`)
        .replace(/&apos;/g, "'");
}

/**
 * Escapes characters that have special meaning in TikZ/LaTeX.
 */
export function escapeTikz(str: string) {
    return str
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/&/g, "\\&")
        .replace(/%/g, "\\%")
        .replace(/\$/g, "\\$")
        .replace(/#/g, "\\#")
        .replace(/_/g, "\\_")
        .replace(/{/g, "\\{")
        .replace(/}/g, "\\}")
        .replace(/\n/g, "\\\\")
        .replace(/\^/g, "\\textasciicircum{}")
        .replace(/~/g, "\\textasciitilde{}");
}

/**
 * Returns the filename or path without its final extension.
 */
export function withoutExtension(str: string) {
    const split = str.split(".");

    return split.length === 1 ?
        str :
        split.slice(0, split.length - 1).join(".");
}

/**
 * Reads a single line from a string starting at a specific index.
 * @param content The full string content.
 * @param start The index to start reading from.
 * @returns An object containing the line text and the index of the next line (or -1 if EOF).
 */
export function readLine(content: string, start: number) {
    let end = start;

    while (end < content.length && content[end] !== "\n") {
        end++;
    }

    const line = content.substring(start, end);
    end++;
    const nextStart = end >= content.length ? -1 : end;

    return {
        line,
        nextStart,
    };
}