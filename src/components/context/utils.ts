export function searchFilter(item: string, searchTerms: Array<string>): boolean {
    return searchTerms
        .map((term) => term.toLowerCase())
        .every((term) => item.toLowerCase().includes(term));
}