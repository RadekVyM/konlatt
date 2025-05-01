import { useRef, useState } from "react";
import { cn } from "../../utils/tailwind";
import useLazyListCount from "../../hooks/useLazyListCount";
import Button from "../inputs/Button";
import CardItemsLazyList from "../CardItemsLazyList";
import { CardContainer } from "../CardContainer";
import ConceptDetail from "./ConceptDetail";
import NothingFound from "../NothingFound";
import CardSection from "../CardSection";
import FilterOrderBar from "../FilterOrderBar";
import Found from "../Found";
import { FormalConcept, FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import { searchTermsToRegex } from "../../utils/search";
import SearchInput from "../inputs/SearchInput";
import ExportButton from "../export/ExportButton";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import useDebouncedSetter from "../../hooks/useDebouncedSetter";

const MAX_TEXT_LENGTH = 500;

export default function Concepts(props: {
    className?: string,
    route: string,
    controls?: React.ReactNode,
    selectedConceptIndex: number | null,
    visibleConceptIndexes: Set<number> | null,
    filteredConcepts: FormalConcepts | null,
    searchTerms: Array<string>,
    storedSearchInput: string,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
    updateSearchInput: (debouncedSearchInput: string) => void,
}) {
    return (
        <CardContainer
            className={props.className}>
            <ConceptsList
                className={cn(props.selectedConceptIndex !== null && "hidden")}
                route={props.route}
                filteredConcepts={props.filteredConcepts}
                searchTerms={props.searchTerms}
                storedSearchInput={props.storedSearchInput}
                updateSearchInput={props.updateSearchInput}
                setSelectedConceptIndex={props.setSelectedConceptIndex}
                visibleConceptIndexes={props.visibleConceptIndexes} />
            {props.selectedConceptIndex !== null &&
                <ConceptDetail
                    key={props.selectedConceptIndex}
                    controls={props.controls}
                    route={props.route}
                    selectedConceptIndex={props.selectedConceptIndex}
                    onBackClick={() => props.setSelectedConceptIndex(null)} />}
        </CardContainer>
    );
}

function ConceptsList(props: {
    className?: string,
    route: string,
    visibleConceptIndexes?: Set<number> | null,
    filteredConcepts: FormalConcepts | null,
    searchTerms: Array<string>,
    storedSearchInput: string,
    setSelectedConceptIndex: (index: number | null) => void,
    updateSearchInput: (debouncedSearchInput: string) => void,
}) {
    const [searchInput, setSearchInput] = useState<string>(props.storedSearchInput);
    const concepts = useDataStructuresStore((state) => state.concepts);
    const disabled = concepts === null;

    useDebouncedSetter(searchInput, props.updateSearchInput, 400);

    const groupedFilteredConcepts = groupByVisibility(props.filteredConcepts || concepts || [], props.visibleConceptIndexes);

    return (
        <CardSection
            className={props.className}>
            <header
                className="pb-1.5 flex flex-col">
                <div
                    className="flex justify-between items-center mb-2.5">
                    <h2
                        className="mx-4 text-lg font-semibold">
                        Concepts
                    </h2>

                    <ExportButton
                        className="mr-4"
                        route={`${props.route}/concepts/export`} />
                </div>
                <div
                    className="self-stretch flex mx-4 mb-2 gap-2">
                    <SearchInput
                        className="flex-1"
                        disabled={disabled}
                        value={searchInput}
                        onChange={setSearchInput}
                        placeholder="Search concepts..." />
                    <FilterOrderBar
                        filterTitle="Filter concepts"
                        sortTitle="Sort concepts"
                        disabled={disabled} />
                </div>

                <Found
                    className="mx-4"
                    found={groupedFilteredConcepts.length}
                    total={concepts?.length || 0} />
            </header>

            <List
                className="flex-1"
                filteredConcepts={groupedFilteredConcepts}
                searchTerms={props.searchTerms}
                visibleConceptIndexes={props.visibleConceptIndexes}
                setSelectedConceptIndex={props.setSelectedConceptIndex} />
        </CardSection>
    );
}

function List(props: {
    className?: string,
    filteredConcepts: ReadonlyArray<FormalConcept>,
    searchTerms: Array<string>,
    visibleConceptIndexes?: Set<number> | null,
    setSelectedConceptIndex: (index: number | null) => void,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const concepts = useDataStructuresStore((state) => state.concepts);
    const context = useDataStructuresStore((state) => state.context);
    const [displayedItemsCount] = useLazyListCount(props.filteredConcepts.length, 20, observerTargetRef);
    const displayedItems = props.filteredConcepts.slice(0, displayedItemsCount);
    const searchRegex = searchTermsToRegex(props.searchTerms);

    if (!context || !concepts || props.filteredConcepts.length === 0) {
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
                        "px-1 py-0.5 concept-list-item",
                        index < props.filteredConcepts.length - 1 && "border-b border-outline-variant")}>
                    <ListItemButton
                        contentClassName={cn(props.visibleConceptIndexes && !props.visibleConceptIndexes?.has(item.index) && "opacity-40")}
                        item={item}
                        context={context}
                        searchRegex={searchRegex}
                        onClick={() => props.setSelectedConceptIndex(item.index)} />
                </li>)}
        </CardItemsLazyList>
    );
}

function ListItemButton(props: {
    contentClassName?: string,
    item: FormalConcept,
    context: FormalContext,
    searchRegex: RegExp | undefined,
    onClick: () => void,
}) {
    return (
        <Button
            className="w-full text-start py-1.5"
            onClick={props.onClick}>
            <div
                className={props.contentClassName}>
                <div className="mb-0.5 text-sm line-clamp-3">
                    {props.item.objects.length > 0 ?
                        <HighlightedSearchTerms
                            text={props.item.objects.map((o) => props.context.objects[o]).join(", ").substring(0, MAX_TEXT_LENGTH)}
                            regex={props.searchRegex} /> :
                        <span className="italic">No objects</span>}
                </div>
                <div className="text-on-surface-container-muted text-xs line-clamp-3">
                    {props.item.attributes.length > 0 ?
                        <HighlightedSearchTerms
                            text={props.item.attributes.map((a) => props.context.attributes[a]).join(", ").substring(0, MAX_TEXT_LENGTH)}
                            regex={props.searchRegex} /> :
                        <span className="italic">No attributes</span>}
                </div>
            </div>
        </Button>
    );
}

function groupByVisibility(
    concepts: ReadonlyArray<FormalConcept>,
    visibleConceptIndexes: Set<number> | null | undefined,
) {
    if (!visibleConceptIndexes) {
        return concepts;
    }

    const start: Array<FormalConcept> = [];
    const end: Array<FormalConcept> = [];

    for (const concept of concepts) {
        if (visibleConceptIndexes.has(concept.index)) {
            start.push(concept);
        }
        else {
            end.push(concept);
        }
    }

    return [...start, ...end];
}