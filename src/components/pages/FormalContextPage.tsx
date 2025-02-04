import { useEffect, useRef, useState } from "react";
import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import useLazyListCount from "../../hooks/useLazyListCount";
import { cn } from "../../utils/tailwind";
import Container from "../Container";
import ContextTable from "../context/ContextTable";
import Button from "../Button";
import { formalContextHasAttribute, RawFormalContext } from "../../types/RawFormalContext";
import { LuChevronLeft } from "react-icons/lu";
import SearchInput from "../SearchInput";

type ContextItem = {
    index: number,
    title: string
}

type ContextAttributeItem = ContextItem
type ContextObjectItem = ContextItem

type ContextCompleteItem = {
    items: Array<ContextItem>
} & ContextItem

export default function ExportPage() {
    const context = useConceptLatticeStore((state) => state.context);
    const [selectedObject, setSelectedObject] = useState<number | null>(null);
    const [selectedAttribute, setSelectedAttribute] = useState<number | null>(null);

    useEffect(() => {
        setSelectedObject(null);
        setSelectedAttribute(null);
    }, [context]);

    return (
        <div className="grid grid-cols-[1fr_1fr] grid-rows-[4fr_3fr] lg:grid-rows-1 lg:grid-cols-[5fr_2fr_2fr] gap-3 flex-1 pb-4 max-h-full overflow-hidden">
            <Context
                className="col-start-1 col-end-3 lg:col-end-2" />

            <Objects
                className="lg:col-start-2 lg:col-end-3 lg:min-w-48"
                selectedObjectIndex={selectedObject}
                setSelectedObjectIndex={setSelectedObject} />
            <Attributes
                className="lg:col-start-3 lg:col-end-4 lg:min-w-48"
                selectedAttributeIndex={selectedAttribute}
                setSelectedAttributeIndex={setSelectedAttribute} />
        </div>
    );
}

function Context(props: {
    className?: string,
}) {
    const context = useConceptLatticeStore((state) => state.context);

    return (
        <Container
            as="section"
            className={cn("flex flex-col overflow-hidden", props.className)}>
            {context ?
                <ContextTable
                    className="flex-1"
                    context={context} /> :
                <>nothing</>}
        </Container>
    );
}

function Objects(props: {
    className?: string,
    selectedObjectIndex: number | null,
    setSelectedObjectIndex: (index: number | null) => void,
}) {
    const context = useConceptLatticeStore((state) => state.context);
    const objects = (context?.objects || []).map<ContextObjectItem>((title, index) => ({ index, title }));
    const selectedObject = context && props.selectedObjectIndex !== null ?
        getContextObject(context, props.selectedObjectIndex) :
        null;

    return (
        <Card
            className={props.className}>
            {selectedObject ? 
                <ItemCard
                    item={selectedObject}
                    backButtonContent="All objects"
                    onBackClick={() => props.setSelectedObjectIndex(null)} /> :
                <ItemsCard
                    items={objects}
                    title="Objects"
                    count={context?.objects.length || 0}
                    searchInputPlaceholder="Search objects..."
                    itemContent={(item: ContextObjectItem) => item.title}
                    itemKey={(item: ContextObjectItem) => item.index}
                    setSelectedItem={(item: ContextObjectItem) => props.setSelectedObjectIndex(item.index)}
                    itemFilter={searchFilter} />}
        </Card>
    );
}

function Attributes(props: {
    className?: string,
    selectedAttributeIndex: number | null,
    setSelectedAttributeIndex: (index: number | null) => void,
}) {
    const context = useConceptLatticeStore((state) => state.context);
    const attributes = (context?.attributes || []).map<ContextAttributeItem>((title, index) => ({ index, title }));
    const selectedAttribute = context && props.selectedAttributeIndex !== null ?
        getContextAttribute(context, props.selectedAttributeIndex) :
        null;

    return (
        <Card
            className={props.className}>
            {selectedAttribute ?
                <ItemCard
                    item={selectedAttribute}
                    backButtonContent="All attributes"
                    onBackClick={() => props.setSelectedAttributeIndex(null)} /> :
                <ItemsCard
                    items={attributes}
                    title="Attributes"
                    count={context?.attributes.length || 0}
                    searchInputPlaceholder="Search attributes..."
                    itemContent={(item: ContextAttributeItem) => item.title}
                    itemKey={(item: ContextAttributeItem) => item.index}
                    setSelectedItem={(item: ContextAttributeItem) => props.setSelectedAttributeIndex(item.index)}
                    itemFilter={searchFilter} />}
        </Card>
    );
}

function ItemsCard(props: {
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
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const [searchInput, setSearchInput] = useState<string>("");
    const searchTerms = searchInput.trim().split(" ").filter((t) => t.length > 0);
    const filteredItems = props.items.filter((item) => props.itemFilter(item, searchTerms));
    const [displayedItemsCount] = useLazyListCount(filteredItems.length, 20, observerTargetRef);
    const displayedItems = filteredItems.slice(0, displayedItemsCount);

    return (
        <>
            <header
                className="pb-3 flex flex-col">
                <span
                    className="flex justify-between items-center">
                    <CardTitle>{props.title}</CardTitle>
                    <span className="text-xs text-on-surface-container-muted mr-4 mb-2">{props.count}</span>
                </span>
                <SearchInput
                    className="self-stretch mx-3"
                    value={searchInput}
                    onChange={setSearchInput}
                    placeholder={props.searchInputPlaceholder} />
            </header>

            <div
                className="flex-1 overflow-y-auto thin-scrollbar">
                <ul className="px-1">
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
                </ul>

                <div ref={observerTargetRef}></div>
            </div>
        </>
    );
}

function ItemCard(props: {
    item: ContextCompleteItem,
    backButtonContent: React.ReactNode,
    onBackClick: () => void,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const [displayedItemsCount] = useLazyListCount(props.item.items.length, 20, observerTargetRef);
    const displayedItems = props.item.items.slice(0, displayedItemsCount);

    return (
        <>
            <header>
                <Button
                    size="sm"
                    className="pl-1 ml-2 mb-1"
                    onClick={props.onBackClick}>
                    <LuChevronLeft />
                    {props.backButtonContent}
                </Button>

                <CardTitle>
                    {props.item.title}
                </CardTitle>
            </header>

            <div
                className="flex-1 overflow-y-auto thin-scrollbar">
                <ul className="px-1">
                    {displayedItems.map((item, index) =>
                        <li
                            key={item.index}
                            className={cn(
                                "px-3 py-1.5 text-start",
                                index < props.item.items.length - 1 && "border-b border-outline-variant")}>
                            {item.title}
                        </li>)}
                </ul>

                <div ref={observerTargetRef}></div>
            </div>
        </>
    );
}

function Card(props: {
    children?: React.ReactNode,
    className?: string,
}) {
    return (
        <Container
            as="section"
            className={cn("pt-3 flex flex-col overflow-hidden", props.className)}>
            {props.children}
        </Container>
    );
}

function CardTitle(props: {
    children: React.ReactNode
}) {
    return (
        <h2
            className="mx-4 mb-2 text-lg font-semibold">
            {props.children}
        </h2>
    );
}

function searchFilter(item: ContextItem, searchTerms: Array<string>): boolean {
    return searchTerms
        .map((term) => term.toLowerCase())
        .every((term) => item.title.toLowerCase().includes(term));
}

function getContextObject(context: RawFormalContext, objectIndex: number): ContextCompleteItem {
    if (objectIndex >= context.objects.length) {
        throw new Error("Object index is out of range");
    }

    const title = context.objects[objectIndex];
    const attributes = new Array<ContextItem>();

    for (let attribute = 0; attribute < context.attributes.length; attribute++) {
        if (formalContextHasAttribute(context, objectIndex, attribute)) {
            attributes.push({
                index: attribute,
                title: context.attributes[attribute],
            });
        }
    }

    return {
        index: objectIndex,
        title,
        items: attributes
    };
}

function getContextAttribute(context: RawFormalContext, attributeIndex: number): ContextCompleteItem {
    if (attributeIndex >= context.attributes.length) {
        throw new Error("Attribute index is out of range");
    }

    const title = context.attributes[attributeIndex];
    const objects = new Array<ContextItem>();

    for (let object = 0; object < context.objects.length; object++) {
        if (formalContextHasAttribute(context, object, attributeIndex)) {
            objects.push({
                index: object,
                title: context.objects[object],
            });
        }
    }

    return {
        index: attributeIndex,
        title,
        items: objects
    };
}