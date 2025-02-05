import { ContextItem } from "./types";

export function searchFilter(item: ContextItem, searchTerms: Array<string>): boolean {
    return searchTerms
        .map((term) => term.toLowerCase())
        .every((term) => item.title.toLowerCase().includes(term));
}