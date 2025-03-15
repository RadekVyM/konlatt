import { useRef } from "react";
import useLazyListCount from "../../hooks/useLazyListCount";
import CardSectionTitle from "../CardSectionTitle";
import CardItemsLazyList from "../CardItemsLazyList";
import { cn } from "../../utils/tailwind";
import { ContextCompleteItem, ContextItem } from "./types";
import BackButton from "../BackButton";
import NothingFound from "../NothingFound";
import CardSection from "../CardSection";

export default function ItemCard(props: {
    className?: string,
    item: ContextCompleteItem,
    backButtonContent: React.ReactNode,
    itemsHeading: React.ReactNode,
    onBackClick: () => void,
}) {
    return (
        <CardSection
            className={props.className}>
            <header>
                <BackButton
                    onClick={props.onBackClick}>
                    {props.backButtonContent}
                </BackButton>

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
        </CardSection>
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
                    key={item.index}
                    className={cn(
                        "px-3 py-1.5 text-start oa-list-item",
                        index < props.items.length - 1 && "border-b border-outline-variant")}>
                    {item.title}
                </li>)}
        </CardItemsLazyList>
    );
}