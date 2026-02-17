/**
 * Checks if a string contains all specified search terms (case-insensitive).
 */
export function searchStringFilter(item: string, searchTerms: Array<string>): boolean {
    return searchTerms
        .map((term) => term.toLowerCase())
        .every((term) => item.toLowerCase().includes(term));
}

/**
 * Converts an array of strings into a case-insensitive Regex with indices.
 */
export function searchTermsToRegex(searchTerms: Array<string>) {
    return searchTerms.length > 0 ?
        new RegExp(`(${searchTerms.map((t) => escapeRegex(t)).join("|")})`, "dig") :
        undefined;
}

/**
 * Splits a string by spaces into an array of non-empty search terms.
 */
export function toSearchTerms(str: string) {
    return str.trim().split(" ").filter((t) => t.length > 0);
}

function escapeRegex (term: string) {
    return term.replace(/[|\\{}()[\]\^$+*?.-]/g, (char: string) => `\\${char}`);
}