import { LuCheck } from "react-icons/lu";
import Button from "../inputs/Button";
import { cn } from "../../utils/tailwind";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import CardItemsLazyList from "../CardItemsLazyList";
import NothingFound from "../NothingFound";
import SearchInput from "../inputs/SearchInput";
import useLazyListCount from "../../hooks/useLazyListCount";
import { searchStringFilter, searchTermsToRegex } from "../../utils/search";
import { useRef, useState } from "react";

type ItemType = {
    index: number,
    title: string,
}

export default function ListFilter<T extends ItemType>(props: {
    items: Array<T>,
    selectedItems: Set<number>,
    searchPlaceholder: string,
    className?: string,
    header?: React.ReactNode,
    searchInputTrail?: React.ReactNode,
    setSelectedItems: React.Dispatch<React.SetStateAction<Set<number>>>,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const [searchInput, setSearchInput] = useState("");
    const searchTerms = searchInput.trim().split(" ").filter((t) => t.length > 0);
    const searchRegex = searchTermsToRegex(searchTerms);
    const filteredItems = props.items.filter((item) => searchStringFilter(item.title, searchTerms));
    const [displayedItemsCount] = useLazyListCount(filteredItems.length, 20, observerTargetRef);
    const displayedItems = filteredItems.slice(0, displayedItemsCount);

    return (
        <>
            {props.header}

            <div
                className="px-5 py-1 flex gap-2">
                <SearchInput
                    className="flex-1"
                    value={searchInput}
                    onChange={setSearchInput}
                    placeholder={props.searchPlaceholder} />
                {props.searchInputTrail}
            </div>

            {displayedItems.length === 0 ?
                <NothingFound
                    className="flex-1" /> :
                <CardItemsLazyList
                    className={cn("flex-1 px-2 py-1 max-h-full", props.className)}
                    observerTargetRef={observerTargetRef}>
                    {displayedItems.map((item, index) =>
                        <li
                            key={item.index}
                            className={cn("px-1 py-0.5 oa-list-item", index < displayedItems.length - 1 && "border-b border-outline-variant")}>
                            <ItemCheckButton
                                item={item}
                                checked={props.selectedItems.has(item.index)}
                                searchRegex={searchRegex}
                                onClick={() => props.setSelectedItems((old) => {
                                    const newSet = new Set(old);

                                    if (newSet.has(item.index)) {
                                        newSet.delete(item.index);
                                    }
                                    else {
                                        newSet.add(item.index);
                                    }

                                    return newSet;
                                })} />
                        </li>)}
                </CardItemsLazyList>}
        </>
    );
}

function ItemCheckButton<T extends ItemType>(props: {
    checked: boolean,
    item: T,
    searchRegex?: RegExp,
    onClick: () => void,
}) {
    return (
        <Button
            className="w-full text-start"
            role="checkbox"
            aria-checked={props.checked}
            onClick={props.onClick}>
            <LuCheck
                className={cn(
                    "p-0.5 bg-primary text-on-primary border border-primary rounded-sm",
                    !props.checked && "bg-surface text-surface border-outline")} />
            <HighlightedSearchTerms
                text={props.item.title}
                regex={props.searchRegex} />
        </Button>
    );
}