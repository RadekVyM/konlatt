import { useRef, useState } from "react";
import BackButton from "../inputs/BackButton";
import Button from "../inputs/Button";
import CardItemsLazyList from "../CardItemsLazyList";
import useLazyListCount from "../../hooks/useLazyListCount";
import { cn } from "../../utils/tailwind";
import NothingFound from "../NothingFound";
import SearchInput from "../inputs/SearchInput";
import { isInfimum, isSupremum } from "../../types/FormalConcepts";
import { searchStringFilter, searchTermsToRegex } from "../../utils/search";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import { LuShapes, LuTag, LuTags } from "react-icons/lu";
import Found from "../Found";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import Tooltip from "../Tooltip";
import HorizontalScroller from "../HorizontalScroller";
import { ExportConceptButtonType } from "../export/createExportConceptButton";
import CardSection from "../layouts/CardSection";

type TabItem = "objects" | "attributes"

export default function ConceptDetail(props: {
    className?: string,
    selectedConceptIndex: number,
    route: string,
    controls?: React.ReactNode,
    exportConceptButton: ExportConceptButtonType,
    onBackClick?: () => void,
}) {
    const ExportConceptButton = props.exportConceptButton;
    const [currentTab, setCurrentTab] = useState<TabItem>("objects");
    const concepts = useDataStructuresStore((state) => state.concepts);
    const context = useDataStructuresStore((state) => state.context);
    const selectedConcept = props.selectedConceptIndex !== null && concepts !== null && props.selectedConceptIndex < concepts.length ?
        concepts[props.selectedConceptIndex] :
        null;
    const isThisInfimum = selectedConcept && context && isInfimum(selectedConcept, context);
    const isThisSupremum = selectedConcept && context && isSupremum(selectedConcept, context);

    return (
        <CardSection
            className={props.className}>
            <header>
                {props.onBackClick &&
                    <div
                        className="flex justify-between items-start w-full pr-4">
                        <BackButton
                            onClick={props.onBackClick}>
                            All concepts
                        </BackButton>

                        <ExportConceptButton
                            conceptIndex={props.selectedConceptIndex}
                            route={`${props.route}/concept/${props.selectedConceptIndex}/export`} />
                    </div>}

                <div
                    className="flex justify-between items-center">
                    <h2
                        className="mx-4 text-lg font-semibold">
                        Concept {props.selectedConceptIndex}
                    </h2>

                    {!props.onBackClick &&
                        <ExportConceptButton
                            className="mr-4"
                            conceptIndex={props.selectedConceptIndex}
                            route={`${props.route}/concept/${props.selectedConceptIndex}/export`} />}
                </div>

                {(isThisInfimum || isThisSupremum) &&
                    <small
                        className="mx-4 block text-sm text-on-surface-container-muted">
                        {isThisInfimum && "most specific"}
                        {isThisInfimum && isThisSupremum && " | "}
                        {isThisSupremum && "most general"}
                    </small>}
            </header>
            
            <div
                className="flex flex-col flex-1 overflow-y-auto thin-scrollbar isolate">
                {props.controls}

                <TabBar
                    className="py-3 sticky top-0 z-10 bg-surface-container"
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab} />

                {currentTab === "objects" ?
                    <ObjectsList
                        objectIndexes={selectedConcept?.objects || []}
                        conceptIndex={props.selectedConceptIndex} /> :
                    currentTab === "attributes" ?
                        <AttributesList
                            attributeIndexes={selectedConcept?.attributes || []}
                            conceptIndex={props.selectedConceptIndex} /> :
                        undefined}
            </div>
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
            className={cn(props.className, "px-4")}>
            <HorizontalScroller>
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
            </HorizontalScroller>
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
    conceptIndex: number,
}) {
    const context = useDataStructuresStore((state) => state.context);
    const objectsLabeling = useDataStructuresStore((state) => state.lattice?.objectsLabeling);
    const labels = objectsLabeling?.get(props.conceptIndex);
    const labelsSet = labels && new Set(labels);

    return (
        <ItemsList
            searchPlaceholder="Search objects..."
            itemIndexes={props.objectIndexes}
            itemContent={(index) => context?.objects[index] || ""}
            itemTailContent={labelsSet ? (index) =>
                labelsSet.has(index) && <Label /> :
                undefined} />
    );
}

function AttributesList(props: {
    attributeIndexes: ReadonlyArray<number>,
    conceptIndex: number,
}) {
    const context = useDataStructuresStore((state) => state.context);
    const attributesLabeling = useDataStructuresStore((state) => state.lattice?.attributesLabeling);
    const labels = attributesLabeling?.get(props.conceptIndex);
    const labelsSet = labels && new Set(labels);

    return (
        <ItemsList
            searchPlaceholder="Search attributes..."
            itemIndexes={props.attributeIndexes}
            itemContent={(index) => context?.attributes[index] || ""}
            itemTailContent={labelsSet ? (index) =>
                labelsSet.has(index) && <Label /> :
                undefined} />
    );
}

function Label() {
    const elementRef = useRef<HTMLElement>(null);

    return (
        <>
            <div
                ref={elementRef as any}
                className="inline-block ml-2.5 translate-y-0.5">
                <LuTag
                    className="h-3 w-3 text-primary" />
            </div>
            <Tooltip
                elementRef={elementRef}
                tooltip="Concept label" />
        </>
    );
}

function ItemsList(props: {
    searchPlaceholder: string,
    itemIndexes: ReadonlyArray<number>,
    itemContent: (index: number) => string,
    itemTailContent?: (index: number) => React.ReactNode,
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
            <div
                className="px-4 flex flex-col sticky top-13 z-10 bg-surface-container">
                <SearchInput
                    className="mb-2"
                    placeholder={props.searchPlaceholder}
                    value={searchInput}
                    onChange={setSearchInput} />
                <Found
                    className="mb-1.5"
                    found={filteredItemIndexes.length}
                    total={props.itemIndexes.length} />
            </div>

            {filteredItemIndexes.length === 0 ?
                <NothingFound
                    className="flex-1" /> :
                <CardItemsLazyList
                    className="flex-1 overflow-y-visible"
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
                            {props.itemTailContent && props.itemTailContent(index)}
                        </li>)}
                </CardItemsLazyList>}
        </>
    );
}