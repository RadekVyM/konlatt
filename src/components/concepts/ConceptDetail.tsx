import { useRef, useState } from "react";
import useProjectStore from "../../hooks/stores/useProjectStore";
import BackButton from "../inputs/BackButton";
import Button from "../inputs/Button";
import CardItemsLazyList from "../CardItemsLazyList";
import useLazyListCount from "../../hooks/useLazyListCount";
import { cn } from "../../utils/tailwind";
import NothingFound from "../NothingFound";
import SearchInput from "../inputs/SearchInput";
import CardSection from "../CardSection";

type TabItem = "objects" | "attributes"

export default function ConceptDetail(props: {
    className?: string,
    selectedConceptIndex: number,
    setSelectedConceptIndex: (index: number | null) => void,
}) {
    const [currentTab, setCurrentTab] = useState<TabItem>("objects");
    const concepts = useProjectStore((state) => state.concepts);
    const selectedConcept = props.selectedConceptIndex !== null && concepts !== null && props.selectedConceptIndex < concepts.length ?
        concepts[props.selectedConceptIndex] :
        null;

    function onBackClick() {
        props.setSelectedConceptIndex(null);
    }

    return (
        <CardSection
            className={props.className}>
            <header
                className="mb-3">
                <BackButton
                    onClick={onBackClick}>
                    All concepts
                </BackButton>
                <h2
                    className="mx-4 mb-2 text-lg font-semibold">
                    Concept {props.selectedConceptIndex}
                </h2>

                <TabBar
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab} />
            </header>

            {currentTab === "objects" ?
                <ObjectsList
                    objectIndexes={selectedConcept?.objects || []} /> :
                currentTab === "attributes" ?
                    <AttributesList
                        attributeIndexes={selectedConcept?.attributes || []} /> :
                    undefined}
        </CardSection>
    );
}

function TabBar(props: {
    currentTab: TabItem,
    setCurrentTab: (item: TabItem) => void,
}) {
    return (
        <div
            className="flex px-4 gap-2">
            <TabButton
                item="objects"
                isSelected={"objects" === props.currentTab}
                setItem={props.setCurrentTab}>
                Objects
            </TabButton>
            <TabButton
                item="attributes"
                isSelected={"attributes" === props.currentTab}
                setItem={props.setCurrentTab}>
                Attributes
            </TabButton>
        </div>
    );
}

function TabButton(props: {
    item: TabItem,
    isSelected: boolean,
    children: React.ReactNode,
    setItem: (item: TabItem) => void,
}) {
    return (
        <Button
            size="sm"
            variant={props.isSelected ? "primary" : "default"}
            onClick={() => props.setItem(props.item)}>
            {props.children}
        </Button>
    );
}

function ObjectsList(props: {
    objectIndexes: ReadonlyArray<number>,
}) {
    const context = useProjectStore((state) => state.context);

    return (
        <ItemsList
            searchPlaceholder="Search objects..."
            itemIndexes={props.objectIndexes}
            itemContent={(index) => context?.objects[index]} />
    );
}

function AttributesList(props: {
    attributeIndexes: ReadonlyArray<number>,
}) {
    const context = useProjectStore((state) => state.context);

    return (
        <ItemsList
            searchPlaceholder="Search attributes..."
            itemIndexes={props.attributeIndexes}
            itemContent={(index) => context?.attributes[index]} />
    );
}

function ItemsList(props: {
    searchPlaceholder: string,
    itemIndexes: ReadonlyArray<number>,
    itemContent: (index: number) => React.ReactNode,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const [searchInput, setSearchInput] = useState("");
    // TODO: implement search
    const [displayedItemsCount] = useLazyListCount(props.itemIndexes.length, 20, observerTargetRef);
    const displayedObjectIndexes = props.itemIndexes.slice(0, displayedItemsCount);

    if (props.itemIndexes.length === 0) {
        return (
            <NothingFound
                className="flex-1" />
        );
    }

    return (
        <>
            <SearchInput
                className="mx-4 mb-2"
                placeholder={props.searchPlaceholder}
                value={searchInput}
                onChange={setSearchInput} />

            <CardItemsLazyList
                className="flex-1"
                observerTargetRef={observerTargetRef}>
                {displayedObjectIndexes.map((index, i) =>
                    <li
                        key={index}
                        className={cn(
                            "px-3 py-1.5 oa-list-item",
                            i < props.itemIndexes.length - 1 && "border-b border-outline-variant")}>
                        {props.itemContent(index)}
                    </li>)}
            </CardItemsLazyList>
        </>
    );
}