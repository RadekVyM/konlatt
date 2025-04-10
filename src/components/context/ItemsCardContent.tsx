import { useRef, useState } from "react";
import useLazyListCount from "../../hooks/useLazyListCount";
import { cn } from "../../utils/tailwind";
import Button from "../inputs/Button";
import SearchInput from "../inputs/SearchInput";
import CardItemsLazyList from "../CardItemsLazyList";
import CardSectionTitle from "../CardSectionTitle";
import NothingFound from "../NothingFound";
import CardSection from "../CardSection";
import { searchStringFilter, searchTermsToRegex } from "../../utils/search";
import FilterOrderBar from "../FilterOrderBar";
import Found from "../Found";
import ExportButton from "../export/ExportButton";

export default function ItemsCardContent(props: {
    title: string,
    count: number,
    searchInputPlaceholder: string,
    filterTitle: string,
    sortTitle: string,
    items: Array<any>,
    route: string,
    className?: string,
    itemKey: (item: any) => string | number,
    itemContent: (item: any, searchRegex?: RegExp) => React.ReactNode,
    setSelectedItem: (item: any) => void,
}) {
    const [searchInput, setSearchInput] = useState<string>("");
    const searchTerms = searchInput.trim().split(" ").filter((t) => t.length > 0);
    const filteredItems = props.items.filter((item) => searchStringFilter(item.title, searchTerms));

    return (
        <CardSection
            className={props.className}>
            <header
                className="pb-1.5 flex flex-col">
                <div
                    className="mb-2 flex justify-between">
                    <CardSectionTitle className="mx-4">{props.title}</CardSectionTitle>
                    <ExportButton
                        className="mr-4"
                        route={`${props.route}/export`} />
                </div>
                <div
                    className="self-stretch flex mx-4 mb-2 gap-2">
                    <SearchInput
                        className="flex-1"
                        value={searchInput}
                        onChange={setSearchInput}
                        placeholder={props.searchInputPlaceholder} />
                    <FilterOrderBar
                        filterTitle={props.filterTitle}
                        sortTitle={props.sortTitle} />
                </div>

                <Found
                    className="mx-4"
                    found={filteredItems.length}
                    total={props.count} />
            </header>

            <List
                className="flex-1"
                searchTerms={searchTerms}
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