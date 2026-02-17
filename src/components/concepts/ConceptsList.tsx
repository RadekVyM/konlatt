import { useRef, useState } from "react";
import { cn } from "../../utils/tailwind";
import useLazyListCount from "../../hooks/useLazyListCount";
import Button from "../inputs/Button";
import CardItemsLazyList from "../CardItemsLazyList";
import NothingFound from "../NothingFound";
import FilterSortBar from "../filters/FilterSortBar";
import Found from "../Found";
import { FormalConcept, FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import { searchTermsToRegex } from "../../utils/search";
import SearchInput from "../inputs/SearchInput";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import useDebouncedSetter from "../../hooks/useDebouncedSetter";
import { ConceptSortType } from "../../types/SortType";
import { SortDirection } from "../../types/SortDirection";
import useDialog from "../../hooks/useDialog";
import ConceptsFilterDialog from "../filters/ConceptsFilterDialog";
import ConceptItemsList from "./ConceptItemsList";
import { ExportButtonProps } from "../export/types/ExportButtonProps";
import CardSection from "../layouts/CardSection";

const MAX_TEXT_LENGTH = 500;

export default function ConceptsList(props: {
    className?: string,
    route: string,
    sublatticeConceptIndexes?: Set<number> | null,
    filteredConcepts: FormalConcepts | null,
    searchTerms: Array<string>,
    storedSearchInput: string,
    sortType: ConceptSortType,
    sortDirection: SortDirection,
    strictSelectedObjects: boolean,
    strictSelectedAttributes: boolean,
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
    minObjectsCount: number | null,
    maxObjectsCount: number | null,
    minAttributesCount: number | null,
    maxAttributesCount: number | null,
    highlightedConceptIndex?: number,
    exportConceptsButton: (props: ExportButtonProps) => React.ReactNode,
    onSortTypeChange: (key: ConceptSortType) => void,
    onSortDirectionChange: (key: SortDirection) => void,
    setSelectedConceptIndex: (index: number | null) => void,
    updateSearchInput: (debouncedSearchInput: string) => void,
    onSelectedFiltersChange: (
        strictSelectedObjects: boolean,
        strictSelectedAttributes: boolean,
        selectedObjects: ReadonlySet<number>,
        selectedAttributes: ReadonlySet<number>,
        minObjectsCount: number | null,
        maxObjectsCount: number | null,
        minAttributesCount: number | null,
        maxAttributesCount: number | null,
    ) => void,
}) {
    const ExportConceptsButton = props.exportConceptsButton;
    const [searchInput, setSearchInput] = useState<string>(props.storedSearchInput);
    const concepts = useDataStructuresStore((state) => state.concepts);
    const disabled = concepts === null;

    useDebouncedSetter(searchInput, props.updateSearchInput, 400);

    const groupedFilteredConcepts = useGroupedAndSorted(
        props.filteredConcepts || concepts || [],
        props.sublatticeConceptIndexes,
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
                    strictSelectedObjects={props.strictSelectedObjects}
                    strictSelectedAttributes={props.strictSelectedAttributes}
                    selectedFilterObjects={props.selectedFilterObjects}
                    selectedFilterAttributes={props.selectedFilterAttributes}
                    minObjectsCount={props.minObjectsCount}
                    maxObjectsCount={props.maxObjectsCount}
                    minAttributesCount={props.minAttributesCount}
                    maxAttributesCount={props.maxAttributesCount}
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
                highlightedConceptIndex={props.highlightedConceptIndex}
                selectedFilterObjects={props.selectedFilterObjects}
                selectedFilterAttributes={props.selectedFilterAttributes}
                sublatticeConceptIndexes={props.sublatticeConceptIndexes}
                setSelectedConceptIndex={props.setSelectedConceptIndex} />
        </CardSection>
    );
}

function Search(props: {
    disabled?: boolean,
    sortType: ConceptSortType,
    sortDirection: SortDirection,
    searchInput: string,
    strictSelectedObjects: boolean,
    strictSelectedAttributes: boolean,
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
    minObjectsCount: number | null,
    maxObjectsCount: number | null,
    minAttributesCount: number | null,
    maxAttributesCount: number | null,
    setSearchInput: React.Dispatch<React.SetStateAction<string>>,
    onSortTypeChange: (key: ConceptSortType) => void,
    onSortDirectionChange: (key: SortDirection) => void,
    onSelectedFiltersChange: (
        strictSelectedObjects: boolean,
        strictSelectedAttributes: boolean,
        selectedObjects: ReadonlySet<number>,
        selectedAttributes: ReadonlySet<number>,
        minObjectsCount: number | null,
        maxObjectsCount: number | null,
        minAttributesCount: number | null,
        maxAttributesCount: number | null,
    ) => void,
}) {
    const filterDialogState = useDialog();
    const withFilterIndicator = props.selectedFilterAttributes.size > 0 ||
        props.selectedFilterObjects.size > 0 ||
        props.minObjectsCount !== null ||
        props.maxObjectsCount !== null ||
        props.minAttributesCount !== null ||
        props.maxAttributesCount !== null;

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
                withFilterIndicator={withFilterIndicator}
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
                strictSelectedObjects={props.strictSelectedObjects}
                strictSelectedAttributes={props.strictSelectedAttributes}
                selectedObjects={props.selectedFilterObjects}
                selectedAttributes={props.selectedFilterAttributes}
                minObjectsCount={props.minObjectsCount}
                maxObjectsCount={props.maxObjectsCount}
                minAttributesCount={props.minAttributesCount}
                maxAttributesCount={props.maxAttributesCount}
                onApply={props.onSelectedFiltersChange} />
        </div>
    );
}

function List(props: {
    className?: string,
    filteredConcepts: ReadonlyArray<FormalConcept>,
    searchTerms: Array<string>,
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
    sublatticeConceptIndexes?: Set<number> | null,
    highlightedConceptIndex?: number,
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
                    {props.highlightedConceptIndex === item.index ?
                        <div
                            className="w-full py-1.5 px-2.5 border border-transparent rounded-md bg-secondary">
                            <ListItemContent
                                className={cn(props.sublatticeConceptIndexes && !props.sublatticeConceptIndexes?.has(item.index) && "opacity-40")}
                                item={item}
                                context={context}
                                searchRegex={searchRegex}
                                selectedFilterObjects={props.selectedFilterObjects}
                                selectedFilterAttributes={props.selectedFilterAttributes} />
                        </div> :
                        <Button
                            className="w-full text-start py-1.5"
                            onClick={() => props.setSelectedConceptIndex(item.index)}>
                            <ListItemContent
                                className={cn(props.sublatticeConceptIndexes && !props.sublatticeConceptIndexes?.has(item.index) && "opacity-40")}
                                item={item}
                                context={context}
                                searchRegex={searchRegex}
                                selectedFilterObjects={props.selectedFilterObjects}
                                selectedFilterAttributes={props.selectedFilterAttributes} />
                        </Button>}
                </li>)}
        </CardItemsLazyList>
    );
}

function ListItemContent(props: {
    className?: string,
    item: FormalConcept,
    context: FormalContext,
    searchRegex: RegExp | undefined,
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
}) {
    return (
        <div
            className={props.className}>
            <div className="mb-0.5 text-sm line-clamp-3">
                <ConceptItemsList
                    noItemsText="No objects"
                    contextItems={props.context.objects}
                    filterItems={props.selectedFilterObjects}
                    items={props.item.objects}
                    searchRegex={props.searchRegex}
                    maxTextLength={MAX_TEXT_LENGTH} />
            </div>
            <div className="text-on-surface-container-muted text-xs line-clamp-3">
                <ConceptItemsList
                    noItemsText="No attributes"
                    contextItems={props.context.attributes}
                    filterItems={props.selectedFilterAttributes}
                    items={props.item.attributes}
                    searchRegex={props.searchRegex}
                    maxTextLength={MAX_TEXT_LENGTH} />
            </div>
        </div>
    );
}

function useGroupedAndSorted(
    concepts: ReadonlyArray<FormalConcept>,
    sublatticeConceptIndexes: Set<number> | null | undefined,
    sortType: ConceptSortType,
    sortDirection: SortDirection,
) {
    const { start, end } = useGroupedByVisibility(concepts, sublatticeConceptIndexes);

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
    sublatticeConceptIndexes: Set<number> | null | undefined,
) {
    if (!sublatticeConceptIndexes) {
        return {
            start: [...concepts],
            end: [],
        };
    }

    const start: Array<FormalConcept> = [];
    const end: Array<FormalConcept> = [];

    for (const concept of concepts) {
        if (sublatticeConceptIndexes.has(concept.index)) {
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