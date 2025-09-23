import { useRef, useState } from "react";
import useLazyListCount from "../../hooks/useLazyListCount";
import { cn } from "../../utils/tailwind";
import Button from "../inputs/Button";
import SearchInput from "../inputs/SearchInput";
import CardItemsLazyList from "../CardItemsLazyList";
import CardSectionTitle from "../CardSectionTitle";
import NothingFound from "../NothingFound";
import CardSection from "../CardSection";
import { searchTermsToRegex } from "../../utils/search";
import FilterSortBar from "../FilterSortBar";
import Found from "../Found";
import { ContextItem } from "./types";
import useDebouncedSetter from "../../hooks/useDebouncedSetter";
import { ItemSortType } from "../../types/SortType";
import { SortDirection } from "../../types/SortDirection";

export default function ItemsCardContent<TItem extends ContextItem>(props: {
    id: string,
    title: string,
    count: number,
    searchInputPlaceholder: string,
    filterTitle: string,
    sortTitle: string,
    items: Array<TItem>,
    filteredItemIndexes: Set<number> | null,
    disabled?: boolean,
    exportButton?: React.ReactNode,
    className?: string,
    searchTerms: Array<string>,
    storedSearchInput: string,
    sortType: ItemSortType,
    sortDirection: SortDirection,
    itemKey: (item: TItem) => string | number,
    itemContent: (item: TItem, searchRegex?: RegExp) => React.ReactNode,
    setSelectedItem: (item: TItem) => void,
    updateSearchInput: (debouncedSearchInput: string) => void,
    onSortTypeChange: (key: ItemSortType) => void,
    onSortDirectionChange: (key: SortDirection) => void,
}) {
    const [searchInput, setSearchInput] = useState<string>(props.storedSearchInput);
    const filteredItems = useFilteredItems(props.items, props.filteredItemIndexes, props.sortType, props.sortDirection);

    useDebouncedSetter(searchInput, props.updateSearchInput, 200);

    return (
        <CardSection
            className={props.className}>
            <header
                className="pb-1.5 flex flex-col">
                <div
                    className="mb-2 flex justify-between">
                    <CardSectionTitle className="mx-4">{props.title}</CardSectionTitle>
                    {props.exportButton}
                </div>
                <div
                    className="self-stretch flex mx-4 mb-2 gap-2">
                    <SearchInput
                        className="flex-1"
                        value={searchInput}
                        onChange={setSearchInput}
                        placeholder={props.searchInputPlaceholder}
                        disabled={props.disabled} />
                    <FilterSortBar<ItemSortType>
                        filterTitle={props.filterTitle}
                        sortTitle={props.sortTitle}
                        disabled={props.disabled}
                        id={`${props.id}-actions`}
                        justify="right"
                        sortType={props.sortType}
                        sortDirection={props.sortDirection}
                        onSortTypeChange={props.onSortTypeChange}
                        onSortDirectionChange={props.onSortDirectionChange}
                        sortItems={[
                            {
                                key: "default",
                                label: "Default",
                            },
                            {
                                key: "alphabet",
                                label: "Alphabet",
                            },
                        ]} />
                </div>

                <Found
                    className="mx-4"
                    found={filteredItems.length}
                    total={props.count} />
            </header>

            <List
                className="flex-1"
                searchTerms={props.searchTerms}
                items={filteredItems}
                itemKey={props.itemKey}
                itemContent={props.itemContent}
                setSelectedItem={props.setSelectedItem} />
        </CardSection>
    );
}

function List(props: {
    className?: string,
    searchTerms: Array<string>,
    items: Array<any>,
    itemKey: (item: any) => string | number,
    itemContent: (item: any, searchRegex?: RegExp) => React.ReactNode,
    setSelectedItem: (item: any) => void,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const searchRegex = searchTermsToRegex(props.searchTerms);
    const [displayedItemsCount] = useLazyListCount(props.items.length, 20, observerTargetRef);
    const displayedItems = props.items.slice(0, displayedItemsCount);

    if (displayedItems.length === 0) {
        return (
            <NothingFound
                className={props.className} />
        );
    }

    return (
        <CardItemsLazyList
            className={props.className}
            observerTargetRef={observerTargetRef}>
            {displayedItems.map((item, index) =>
                <li
                    key={props.itemKey(item)}
                    className={cn(
                        "px-1 py-0.5 oa-list-item",
                        index < displayedItems.length - 1 && "border-b border-outline-variant")}>
                    <Button
                        className="w-full text-start"
                        onClick={() => props.setSelectedItem(item)}>
                        {props.itemContent(item, searchRegex)}
                    </Button>
                </li>)}
        </CardItemsLazyList>
    );
}

function useFilteredItems<T extends ContextItem>(
    items: ReadonlyArray<T>,
    filteredItemIndexes: Set<number> | null,
    sortType: ItemSortType,
    sortDirection: SortDirection,
) {
    const result = new Array<T>();

    for (let i = 0; i < items.length; i++) {
        if (!filteredItemIndexes || filteredItemIndexes.has(i)) {
            result.push(items[i]);
        }
    }

    if (sortType === "alphabet") {
        result.sort((a, b) => a.title < b.title ? -1 : 1);
    }

    if (sortDirection === "desc") {
        result.reverse();
    }

    return result;
}