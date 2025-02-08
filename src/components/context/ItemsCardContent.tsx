import { useRef, useState } from "react";
import useLazyListCount from "../../hooks/useLazyListCount";
import { cn } from "../../utils/tailwind";
import Button from "../inputs/Button";
import SearchInput from "../SearchInput";
import CardItemsLazyList from "../CardItemsLazyList";
import CardSectionTitle from "../CardSectionTitle";

export default function ItemsCardContent(props: {
    title: string,
    count: number,
    searchInputPlaceholder: string,
    items: Array<any>,
    itemKey: (item: any) => string | number,
    itemContent: (item: any) => React.ReactNode,
    itemFilter: (item: any, searchTerms: Array<string>) => boolean,
    setSelectedItem: (item: any) => void,
    className?: string,
}) {
    const [searchInput, setSearchInput] = useState<string>("");

    return (
        <div className="animate-fadeIn">
            <header
                className="pb-3 flex flex-col">
                <span
                    className="flex justify-between items-center mb-2">
                    <CardSectionTitle className="mx-4">{props.title}</CardSectionTitle>
                    <span className="text-xs text-on-surface-container-muted mr-4">{props.count}</span>
                </span>
                <SearchInput
                    className="self-stretch mx-3"
                    value={searchInput}
                    onChange={setSearchInput}
                    placeholder={props.searchInputPlaceholder} />
            </header>

            <List
                className="flex-1"
                searchInput={searchInput}
                items={props.items}
                itemKey={props.itemKey}
                itemContent={props.itemContent}
                itemFilter={props.itemFilter}
                setSelectedItem={props.setSelectedItem} />
        </div>
    );
}

function List(props: {
    className?: string,
    searchInput: string,
    items: Array<any>,
    itemKey: (item: any) => string | number,
    itemContent: (item: any) => React.ReactNode,
    itemFilter: (item: any, searchTerms: Array<string>) => boolean,
    setSelectedItem: (item: any) => void,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const searchTerms = props.searchInput.trim().split(" ").filter((t) => t.length > 0);
    const filteredItems = props.items.filter((item) => props.itemFilter(item, searchTerms));
    const [displayedItemsCount] = useLazyListCount(filteredItems.length, 20, observerTargetRef);
    const displayedItems = filteredItems.slice(0, displayedItemsCount);

    if (displayedItems.length === 0) {
        return (
            <div
                className={cn("grid place-content-center text-sm text-on-surface-container-muted", props.className)}>
                Nothing found
            </div>
        )
    }

    return (
        <CardItemsLazyList
            className={props.className}
            observerTargetRef={observerTargetRef}>
            {displayedItems.map((item, index) =>
                <li
                    key={props.itemKey(item)}
                    className={cn(
                        "px-1 py-0.5",
                        index < props.items.length - 1 && "border-b border-outline-variant")}>
                    <Button
                        className="w-full text-start"
                        onClick={() => props.setSelectedItem(item)}>
                        {props.itemContent(item)}
                    </Button>
                </li>)}
        </CardItemsLazyList>
    );
}