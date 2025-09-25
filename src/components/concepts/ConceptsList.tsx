import { useRef, useState } from "react";
import { cn } from "../../utils/tailwind";
import useLazyListCount from "../../hooks/useLazyListCount";
import Button from "../inputs/Button";
import CardItemsLazyList from "../CardItemsLazyList";
import { CardContainer } from "../CardContainer";
import ConceptDetail from "./ConceptDetail";
import NothingFound from "../NothingFound";
import CardSection from "../CardSection";
import FilterSortBar from "../filters/FilterSortBar";
import Found from "../Found";
import { FormalConcept, FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import { searchTermsToRegex } from "../../utils/search";
import SearchInput from "../inputs/SearchInput";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import useDebouncedSetter from "../../hooks/useDebouncedSetter";
import ExportConceptsButton from "../export/ExportConceptsButton";
import { ConceptSortType } from "../../types/SortType";
import { SortDirection } from "../../types/SortDirection";
import useDialog from "../../hooks/useDialog";
import ConceptsFilterDialog from "../filters/ConceptsFilterDialog";

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
    sortType: ConceptSortType,
    sortDirection: SortDirection,
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
    onSortTypeChange: (key: ConceptSortType) => void,
    onSortDirectionChange: (key: SortDirection) => void,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
    updateSearchInput: (debouncedSearchInput: string) => void,
    onSelectedFiltersChange: (selectedObjects: ReadonlySet<number>, selectedAttributes: ReadonlySet<number>) => void,
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
                visibleConceptIndexes={props.visibleConceptIndexes}
                sortType={props.sortType}
                sortDirection={props.sortDirection}
                onSortTypeChange={props.onSortTypeChange}
                onSortDirectionChange={props.onSortDirectionChange}
                selectedFilterObjects={props.selectedFilterObjects}
                selectedFilterAttributes={props.selectedFilterAttributes}
                onSelectedFiltersChange={props.onSelectedFiltersChange} />
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
    sortType: ConceptSortType,
    sortDirection: SortDirection,
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
    onSortTypeChange: (key: ConceptSortType) => void,
    onSortDirectionChange: (key: SortDirection) => void,
    setSelectedConceptIndex: (index: number | null) => void,
    updateSearchInput: (debouncedSearchInput: string) => void,
    onSelectedFiltersChange: (selectedObjects: ReadonlySet<number>, selectedAttributes: ReadonlySet<number>) => void,
}) {
    const [searchInput, setSearchInput] = useState<string>(props.storedSearchInput);
    const concepts = useDataStructuresStore((state) => state.concepts);
    const disabled = concepts === null;

    useDebouncedSetter(searchInput, props.updateSearchInput, 400);

    const groupedFilteredConcepts = useGroupedAndSorted(
        props.filteredConcepts || concepts || [],
        props.visibleConceptIndexes,
        props.sortType,
        props.sortDirection);

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

                    <ExportConceptsButton
                        className="mr-4"
                        route={`${props.route}/concepts/export`} />
                </div>

                <Search
                    disabled={disabled}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    sortType={props.sortType}
                    sortDirection={props.sortDirection}
                    onSortTypeChange={props.onSortTypeChange}
                    onSortDirectionChange={props.onSortDirectionChange}
                    selectedFilterObjects={props.selectedFilterObjects}
                    selectedFilterAttributes={props.selectedFilterAttributes}
                    onSelectedFiltersChange={props.onSelectedFiltersChange} />

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

function Search(props: {
    disabled?: boolean,
    sortType: ConceptSortType,
    sortDirection: SortDirection,
    searchInput: string,
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
    setSearchInput: React.Dispatch<React.SetStateAction<string>>,
    onSortTypeChange: (key: ConceptSortType) => void,
    onSortDirectionChange: (key: SortDirection) => void,
    onSelectedFiltersChange: (selectedObjects: ReadonlySet<number>, selectedAttributes: ReadonlySet<number>) => void,
}) {
    const filterDialogState = useDialog();

    return (
        <div
            className="self-stretch flex mx-4 mb-2 gap-2">
            <SearchInput
                className="flex-1"
                disabled={props.disabled}
                value={props.searchInput}
                onChange={props.setSearchInput}
                placeholder="Search concepts..." />
            <FilterSortBar<ConceptSortType>
                withFilterIndicator={props.selectedFilterAttributes.size > 0 || props.selectedFilterObjects.size > 0}
                filterTitle="Filter concepts"
                sortTitle="Sort concepts"
                disabled={props.disabled}
                id="concepts-actions"
                justify="right"
                onFilterClick={filterDialogState.show}
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
                        key: "objects-count",
                        label: "Objects count",
                    },
                    {
                        key: "attributes-count",
                        label: "Attributes count",
                    },
                ]} />

            <ConceptsFilterDialog
                state={filterDialogState}
                selectedObjects={props.selectedFilterObjects}
                selectedAttributes={props.selectedFilterAttributes}
                onApply={props.onSelectedFiltersChange} />
        </div>
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

function useGroupedAndSorted(
    concepts: ReadonlyArray<FormalConcept>,
    visibleConceptIndexes: Set<number> | null | undefined,
    sortType: ConceptSortType,
    sortDirection: SortDirection,
) {
    const { start, end } = useGroupedByVisibility(concepts, visibleConceptIndexes);

    if (sortType === "objects-count") {
        start.sort((a, b) => a.objects.length - b.objects.length);
        end.sort((a, b) => a.objects.length - b.objects.length);
    }

    if (sortType === "attributes-count") {
        start.sort((a, b) => a.attributes.length - b.attributes.length);
        end.sort((a, b) => a.attributes.length - b.attributes.length);
    }

    if (sortDirection === "desc") {
        start.reverse();
        end.reverse();
    }

    return [...start, ...end];
}

function useGroupedByVisibility(
    concepts: ReadonlyArray<FormalConcept>,
    visibleConceptIndexes: Set<number> | null | undefined,
) {
    if (!visibleConceptIndexes) {
        return {
            start: [...concepts],
            end: [],
        };
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

    return {
        start,
        end,
    };
}