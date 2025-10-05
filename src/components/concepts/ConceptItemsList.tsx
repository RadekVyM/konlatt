import { Fragment, useMemo } from "react";
import HighlightedSearchTerms from "../HighlightedSearchTerms";

export default function ConceptItemsList(props: {
    noItemsText: string,
    items: ReadonlyArray<number>,
    searchRegex?: RegExp,
    contextItems: ReadonlyArray<string>,
    filterItems: ReadonlySet<number>,
    maxTextLength?: number,
}) {
    if (props.items.length === 0) {
        return (
            <span className="italic">{props.noItemsText}</span>
        );
    }

    return (
        <NonemptyConceptItemsList
            {...props} />
    );
}

function NonemptyConceptItemsList(props: {
    items: ReadonlyArray<number>,
    searchRegex?: RegExp,
    contextItems: ReadonlyArray<string>,
    filterItems: ReadonlySet<number>,
    maxTextLength?: number,
}) {
    const items = useGroupedItems(props.items, props.contextItems, props.filterItems, props.searchRegex, props.maxTextLength);
    return items.map((item, i) => <Fragment key={i}>{item}</Fragment>)
}

function useGroupedItems(
    items: ReadonlyArray<number>,
    contextItems: ReadonlyArray<string>,
    filterItems: ReadonlySet<number>,
    searchRegex?: RegExp,
    maxTextLength?: number,
): Array<React.ReactNode> {
    return useMemo(() => {
        const result = new Array<React.ReactNode>();
        let nonhighlightedItems = new Array<string>();
        let textLength = 0;

        for (const item of items) {
            const itemTitle = contextItems[item];

            if (maxTextLength !== undefined && textLength + itemTitle.length > maxTextLength) {
                break;
            }

            if (filterItems.has(item)) {
                const text = `${result.length === 0 ? "" : ", "}${nonhighlightedItems.join(", ")}${nonhighlightedItems.length === 0 ? "" : ", "}`;
                if (text.length > 0) {
                    result.push(createHighlightedItems(text, searchRegex));
                }
                result.push(<span className="text-primary bg-primary-lite rounded-xs">{itemTitle}</span>);
                nonhighlightedItems = [];
            }
            else {
                nonhighlightedItems.push(itemTitle);
            }

            textLength += itemTitle.length;

            if (textLength !== 0) {
                textLength += 2; // comma and space
            }
        }

        if (nonhighlightedItems.length > 0) {
            const text = `${result.length === 0 ? "" : ", "}${nonhighlightedItems.join(", ")}`;
            result.push(createHighlightedItems(text, searchRegex));
        }

        return result;
    }, [items, contextItems, filterItems, searchRegex]);
}

function createHighlightedItems(text: string, searchRegex?: RegExp) {
    return (
        <HighlightedSearchTerms
            text={text}
            regex={searchRegex} />
    );
}