import { useRef, useState } from "react";
import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import BackButton from "../BackButton";
import Button from "../inputs/Button";
import CardItemsLazyList from "../CardItemsLazyList";
import useLazyListCount from "../../hooks/useLazyListCount";
import { cn } from "../../utils/tailwind";
import NothingFound from "../NothingFound";

type TabItem = "objects" | "attributes"

export default function ConceptDetail(props: {
    selectedConceptIndex: number,
    setSelectedConceptIndex: (index: number | null) => void,
}) {
    const [currentTab, setCurrentTab] = useState<TabItem>("objects");
    const concepts = useConceptLatticeStore((state) => state.concepts);
    const selectedConcept = props.selectedConceptIndex !== null && concepts !== null && props.selectedConceptIndex < concepts.length ?
        concepts[props.selectedConceptIndex] :
        null;

    function onBackClick() {
        props.setSelectedConceptIndex(null);
    }

    return (
        <>
            <header
                className="mb-2">
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
        </>
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
    objectIndexes: Array<number>,
}) {
    const context = useConceptLatticeStore((state) => state.context);

    return (
        <ItemsList
            itemIndexes={props.objectIndexes}
            itemContent={(index) => context?.objects[index]} />
    );
}

function AttributesList(props: {
    attributeIndexes: Array<number>,
}) {
    const context = useConceptLatticeStore((state) => state.context);

    return (
        <ItemsList
            itemIndexes={props.attributeIndexes}
            itemContent={(index) => context?.attributes[index]} />
    );
}

function ItemsList(props: {
    itemIndexes: Array<number>,
    itemContent: (index: number) => React.ReactNode,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const [displayedItemsCount] = useLazyListCount(props.itemIndexes.length, 20, observerTargetRef);
    const displayedObjectIndexes = props.itemIndexes.slice(0, displayedItemsCount);

    if (props.itemIndexes.length === 0) {
        return (
            <NothingFound
                className="flex-1" />
        );
    }

    return (
        <CardItemsLazyList
            className="flex-1"
            observerTargetRef={observerTargetRef}>
            {displayedObjectIndexes.map((index, i) =>
                <li
                    key={index}
                    className={cn(
                        "px-3 py-1.5",
                        i < props.itemIndexes.length - 1 && "border-b border-outline-variant")}>
                    {props.itemContent(index)}
                </li>)}
        </CardItemsLazyList>
    );
}