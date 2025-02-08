import { useRef } from "react";
import useLazyListCount from "../../hooks/useLazyListCount";
import Button from "../inputs/Button";
import { LuChevronLeft } from "react-icons/lu";
import CardSectionTitle from "../CardSectionTitle";
import CardItemsLazyList from "../CardItemsLazyList";
import { cn } from "../../utils/tailwind";
import { ContextCompleteItem, ContextItem } from "./types";

export default function ItemCard(props: {
    item: ContextCompleteItem,
    backButtonContent: React.ReactNode,
    itemsHeading: React.ReactNode,
    onBackClick: () => void,
}) {
    return (
        <div className="animate-fadeIn">
            <header>
                <Button
                    size="sm"
                    className="pl-1 ml-2 mb-1"
                    onClick={props.onBackClick}>
                    <LuChevronLeft />
                    {props.backButtonContent}
                </Button>

                <CardSectionTitle
                    className="mx-4 mb-2">
                    {props.item.title}
                </CardSectionTitle>
            </header>

            <h3 className="text-on-surface-container-muted text-xs mx-4 mb-1">
                {props.itemsHeading}:
            </h3>

            <List
                className="flex-1"
                items={props.item.items} />
        </div>
    );
}

function List(props: {
    className?: string,
    items: Array<ContextItem>,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const [displayedItemsCount] = useLazyListCount(props.items.length, 20, observerTargetRef);
    const displayedItems = props.items.slice(0, displayedItemsCount);

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
                    key={item.index}
                    className={cn(
                        "px-3 py-1.5 text-start",
                        index < props.items.length - 1 && "border-b border-outline-variant")}>
                    {item.title}
                </li>)}
        </CardItemsLazyList>
    );
}