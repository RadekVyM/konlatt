export function searchTermsToRegex(searchTerms: Array<string>) {
    return searchTerms.length > 0 ?
        new RegExp(`(${searchTerms.map((t) => escapeRegex(t)).join("|")})`, "dig") :
        undefined;
}

function escapeRegex (term: string) {
    return term.replace(/[|\\{}()[\]\^$+*?.-]/g, (char: string) => `\\${char}`);
}