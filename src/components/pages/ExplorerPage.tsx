import { cn } from "../../utils/tailwind";
import ConceptsList from "../concepts/ConceptsList";
import Container from "../Container";
import PageContainer from "../PageContainer";
import useExplorerStore from "../../stores/useExplorerStore";

export default function ExplorerPage() {
    return (
        <PageContainer
            className="grid grid-cols-1 grid-rows-[5fr_4fr] md:grid-rows-1 md:grid-cols-[minmax(18rem,2fr)_5fr] xl:grid-cols-[1fr_2.5fr_1fr] gap-2">
            <Concepts />
            <Diagram
                className="col-start-1 col-end-2 row-start-1 row-end-2 md:col-start-2 md:col-end-3 xl:col-end-4 md:row-start-1 md:row-end-2" />
        </PageContainer>
    );
}

function Concepts() {
    const selectedConceptIndex = useExplorerStore((state) => state.selectedConceptIndex);
    const filteredConcepts = useExplorerStore((state) => state.filteredConcepts);
    const searchTerms = useExplorerStore((state) => state.searchTerms);
    const debouncedSearchInput = useExplorerStore((state) => state.debouncedSearchInput);
    const setSelectedConceptIndex = useExplorerStore((state) => state.setSelectedConceptIndex);
    const updateSearchInput = useExplorerStore((state) => state.setDebouncedSearchInput);
    const sortType = useExplorerStore((state) => state.sortType);
    const sortDirection = useExplorerStore((state) => state.sortDirection);
    const setSortType = useExplorerStore((state) => state.setSortType);
    const setSortDirection = useExplorerStore((state) => state.setSortDirection);
    const selectedFilterObjects = useExplorerStore((state) => state.selectedFilterObjects);
    const selectedFilterAttributes = useExplorerStore((state) => state.selectedFilterAttributes);
    const minObjectsCount = useExplorerStore((state) => state.minObjectsCount);
    const maxObjectsCount = useExplorerStore((state) => state.maxObjectsCount);
    const minAttributesCount = useExplorerStore((state) => state.minAttributesCount);
    const maxAttributesCount = useExplorerStore((state) => state.maxAttributesCount);
    const setSelectedFilters = useExplorerStore((state) => state.setSelectedFilters);

    return (
        <ConceptsList
            route="/project/explorer"
            selectedConceptIndex={selectedConceptIndex}
            setSelectedConceptIndex={setSelectedConceptIndex}
            updateSearchInput={updateSearchInput}
            filteredConcepts={filteredConcepts}
            searchTerms={searchTerms}
            storedSearchInput={debouncedSearchInput}
            sortType={sortType}
            sortDirection={sortDirection}
            onSortTypeChange={setSortType}
            onSortDirectionChange={setSortDirection}
            visibleConceptIndexes={null}
            selectedFilterObjects={selectedFilterObjects}
            selectedFilterAttributes={selectedFilterAttributes}
            minObjectsCount={minObjectsCount}
            maxObjectsCount={maxObjectsCount}
            minAttributesCount={minAttributesCount}
            maxAttributesCount={maxAttributesCount}
            onSelectedFiltersChange={setSelectedFilters} />
    );
}

function Diagram(props: {
    className?: string,
}) {
    return (
        <Container
            as="section"
            className={cn("overflow-hidden relative", props.className)}>

        </Container>
    );
}