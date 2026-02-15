import { cn } from "../../utils/tailwind";
import ConceptsList from "../concepts/ConceptsList";
import Container from "../Container";
import PageContainer from "../PageContainer";
import useExplorerStore from "../../stores/explorer/useExplorerStore";
import { CardContainer } from "../CardContainer";
import ConceptDetail from "../concepts/ConceptDetail";
import ExportExplorerConceptsButton from "../export/ExportExplorerConceptsButton";
import ExportExplorerConceptButton from "../export/ExportExplorerConceptButton";
import R3FExplorerCanvas from "../concepts/explorer/R3FExplorerCanvas";
import { useEffect, useState } from "react";
import ConceptHoverDetail from "../concepts/ConceptHoverDetail";
import { ExplorerZoomActionsContextProvider } from "../../contexts/ExplorerZoomActionsContext";
import ExplorerActions from "../concepts/explorer/ExplorerActions";

export default function ExplorerPage() {
    return (
        <ExplorerZoomActionsContextProvider>
            <PageContainer
                className="grid grid-cols-2 grid-rows-2 lg:grid-rows-1 lg:grid-cols-[minmax(18rem,1fr)_minmax(18rem,1fr)_2.5fr] gap-2">
                <Concepts />
                <Concept />
                <Explorer
                    className="col-start-1 col-end-3 row-start-2 row-end-3 lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2" />
                <ConceptHoverDetail
                    useStore={useExplorerStore} />
            </PageContainer>
        </ExplorerZoomActionsContextProvider>
    );
}

function Concepts(props: {
    className?: string,
}) {
    const filteredConcepts = useExplorerStore((state) => state.filteredConcepts);
    const searchTerms = useExplorerStore((state) => state.searchTerms);
    const debouncedSearchInput = useExplorerStore((state) => state.debouncedSearchInput);
    const selectedConceptIndex = useExplorerStore((state) => state.selectedConceptIndex);
    const setSelectedConceptIndex = useExplorerStore((state) => state.setSelectedConceptIndex);
    const updateSearchInput = useExplorerStore((state) => state.setDebouncedSearchInput);
    const sortType = useExplorerStore((state) => state.sortType);
    const sortDirection = useExplorerStore((state) => state.sortDirection);
    const setSortType = useExplorerStore((state) => state.setSortType);
    const setSortDirection = useExplorerStore((state) => state.setSortDirection);
    const strictSelectedObjects = useExplorerStore((state) => state.strictSelectedObjects);
    const strictSelectedAttributes = useExplorerStore((state) => state.strictSelectedAttributes);
    const selectedFilterObjects = useExplorerStore((state) => state.selectedFilterObjects);
    const selectedFilterAttributes = useExplorerStore((state) => state.selectedFilterAttributes);
    const minObjectsCount = useExplorerStore((state) => state.minObjectsCount);
    const maxObjectsCount = useExplorerStore((state) => state.maxObjectsCount);
    const minAttributesCount = useExplorerStore((state) => state.minAttributesCount);
    const maxAttributesCount = useExplorerStore((state) => state.maxAttributesCount);
    const setSelectedFilters = useExplorerStore((state) => state.setSelectedFilters);

    return (
        <CardContainer
            className={props.className}>
            <ConceptsList
                route="/project/explorer"
                exportConceptsButton={ExportExplorerConceptsButton}
                setSelectedConceptIndex={setSelectedConceptIndex}
                updateSearchInput={updateSearchInput}
                highlightedConceptIndex={selectedConceptIndex ?? undefined}
                filteredConcepts={filteredConcepts}
                searchTerms={searchTerms}
                storedSearchInput={debouncedSearchInput}
                sortType={sortType}
                sortDirection={sortDirection}
                onSortTypeChange={setSortType}
                onSortDirectionChange={setSortDirection}
                sublatticeConceptIndexes={null}
                strictSelectedObjects={strictSelectedObjects}
                strictSelectedAttributes={strictSelectedAttributes}
                selectedFilterObjects={selectedFilterObjects}
                selectedFilterAttributes={selectedFilterAttributes}
                minObjectsCount={minObjectsCount}
                maxObjectsCount={maxObjectsCount}
                minAttributesCount={minAttributesCount}
                maxAttributesCount={maxAttributesCount}
                onSelectedFiltersChange={setSelectedFilters} />
        </CardContainer>
    );
}

function Concept(props: {
    className?: string,
}) {
    const selectedConceptIndex = useExplorerStore((state) => state.selectedConceptIndex);

    return (
        <CardContainer
            className={props.className}>
            {selectedConceptIndex !== null ?
                <ConceptDetail
                    key={selectedConceptIndex}
                    exportConceptButton={ExportExplorerConceptButton}
                    route="/project/explorer"
                    selectedConceptIndex={selectedConceptIndex} /> :
                <div
                    className="h-full grid place-content-center">
                    <span
                        className="text-center text-sm text-on-surface-container-muted">
                        No concept selected
                    </span>
                </div>}
        </CardContainer>
    );
}

function Explorer(props: {
    className?: string,
}) {
    const [canRenderCanvas, setCanRenderCanvas] = useState<boolean>(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => setCanRenderCanvas(true), 500);
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <Container
            as="section"
            className={cn("overflow-hidden relative", props.className)}>
            {canRenderCanvas &&
                <R3FExplorerCanvas />}
            <ExplorerActions />
        </Container>
    );
}