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
import { isInfimum, isSupremum } from "../../types/FormalConcepts";
import { searchStringFilter, searchTermsToRegex } from "../../utils/search";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import { LuShapes, LuTags, LuTriangle } from "react-icons/lu";
import Found from "../Found";

type TabItem = "objects" | "attributes"

export default function ConceptDetail(props: {
    className?: string,
    selectedConceptIndex: number,
    setSelectedConceptIndex: (index: number | null) => void,
}) {
    const [currentTab, setCurrentTab] = useState<TabItem>("objects");
    const concepts = useProjectStore((state) => state.concepts);
    const context = useProjectStore((state) => state.context);
    const selectedConcept = props.selectedConceptIndex !== null && concepts !== null && props.selectedConceptIndex < concepts.length ?
        concepts[props.selectedConceptIndex] :
        null;
    const isThisInfimum = selectedConcept && context && isInfimum(selectedConcept, context);
    const isThisSupremum = selectedConcept && context && isSupremum(selectedConcept, context);

    function onBackClick() {
        props.setSelectedConceptIndex(null);
    }

    return (
        <CardSection
            className={props.className}>
            <header>
                <BackButton
                    onClick={onBackClick}>
                    All concepts
                </BackButton>
                <h2
                    className="mx-4 text-lg font-semibold">
                    Concept {props.selectedConceptIndex}
                </h2>

                {(isThisInfimum || isThisSupremum) &&
                    <small
                        className="mx-4 block text-sm text-on-surface-container-muted">
                        {isThisInfimum && "infimum"}
                        {isThisInfimum && isThisSupremum && " | "}
                        {isThisSupremum && "supremum"}
                    </small>}

                {!isThisInfimum && !isThisSupremum &&
                    <div
                        className="mx-4 mt-2.5 flex gap-2 flex-wrap">
                        <Button
                            variant="secondary"
                            size="sm">
                            <LuTriangle className="-scale-y-100" /> Upper cone only
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm">
                            <LuTriangle /> Lower cone only
                        </Button>
                    </div>}
            </header>

            <TabBar
                className="mt-5 mb-3"
                currentTab={currentTab}
                setCurrentTab={setCurrentTab} />

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
    className?: string,
    currentTab: TabItem,
    setCurrentTab: (item: TabItem) => void,
}) {
    return (
        <div
            className={cn(props.className, "flex gap-2 px-4")}>
            <TabButton
                item="objects"
                isSelected={"objects" === props.currentTab}
                setItem={props.setCurrentTab}>
                <LuShapes /> Objects
            </TabButton>
            <TabButton
                item="attributes"
                isSelected={"attributes" === props.currentTab}
                setItem={props.setCurrentTab}>
                <LuTags /> Attributes
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
            itemContent={(index) => context?.objects[index] || ""} />
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
            itemContent={(index) => context?.attributes[index] || ""} />
    );
}

function ItemsList(props: {
    searchPlaceholder: string,
    itemIndexes: ReadonlyArray<number>,
    itemContent: (index: number) => string,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const [searchInput, setSearchInput] = useState("");
    const searchTerms = searchInput.trim().split(" ").filter((t) => t.length > 0);
    const searchRegex = searchTermsToRegex(searchTerms);
    const filteredItemIndexes = props.itemIndexes.filter((itemIndex) => searchStringFilter(props.itemContent(itemIndex), searchTerms));
    const [displayedItemsCount] = useLazyListCount(filteredItemIndexes.length, 20, observerTargetRef);
    const displayedObjectIndexes = filteredItemIndexes.slice(0, displayedItemsCount);

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

            {filteredItemIndexes.length === 0 ?
                <NothingFound
                    className="flex-1" /> :
                <>
                    <Found
                        className="mx-4 mb-1.5"
                        found={filteredItemIndexes.length}
                        total={props.itemIndexes.length} />
                    <CardItemsLazyList
                        className="flex-1"
                        observerTargetRef={observerTargetRef}>
                        {displayedObjectIndexes.map((index, i) =>
                            <li
                                key={index}
                                className={cn(
                                    "px-3 py-1.5 oa-list-item",
                                    i < displayedObjectIndexes.length - 1 && "border-b border-outline-variant")}>
                                <HighlightedSearchTerms
                                    text={props.itemContent(index)}
                                    regex={searchRegex} />
                            </li>)}
                    </CardItemsLazyList>
                </>}
        </>
    );
}