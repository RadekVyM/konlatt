import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/tailwind";
import Container from "../Container";
import ConceptsList from "../concepts/ConceptsList";
import PageContainer from "../PageContainer";
import useFullscreen from "../../hooks/useFullscreen";
import { FullscreenState } from "../../types/FullscreenState";
import DiagramConfig from "../concepts/diagram/DiagramConfig";
import { ZoomActionsContextProvider } from "../../contexts/ZoomActionsContext";
import useDiagramStore from "../../stores/diagram/useDiagramStore";
import ConceptDiagramControls from "../concepts/diagram/ConceptDiagramControls";
import DiagramCanvas from "../concepts/diagram/R3FDiagramCanvas";
import DiagramActions from "../concepts/diagram/DiagramActions";

export default function DiagramPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const fullscreenState = useFullscreen(containerRef);
    const [conceptsPanelEnabled, setConceptsPanelEnabled] = useState<boolean>(true);
    const [configPanelEnabled, setConfigPanelEnabled] = useState<boolean>(true);

    return (
        <ZoomActionsContextProvider>
            <PageContainer
                ref={containerRef}
                className={cn(
                    "grid grid-cols-[1fr_1fr] grid-rows-[5fr_4fr] md:grid-cols-[minmax(18rem,2fr)_5fr] md:grid-rows-[6fr_4fr] xl:grid-cols-[1fr_2.5fr_1fr] xl:grid-rows-1 gap-2 isolate",
                    fullscreenState.isFullscreen && "bg-surface p-0")}>
                <Concepts
                    className={cn(
                        "col-start-1 col-end-2 row-start-2 row-end-3 md:row-start-1 md:row-end-2",
                        "z-10",
                        fullscreenState.isFullscreen && "mt-0 ml-4 mb-4 md:mb-0 md:mt-4 xl:mb-4 shadow-lg",
                        fullscreenState.isFullscreen && !(configPanelEnabled && conceptsPanelEnabled) && "hidden xl:block",
                        fullscreenState.isFullscreen && !conceptsPanelEnabled && "xl:hidden",)} />
                <Diagram
                    className={cn(
                        !fullscreenState.isFullscreen ?
                            "col-start-1 col-end-3 row-start-1 row-end-2 md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-3 xl:row-end-2" :
                            "grid grid-rows-subgrid grid-cols-subgrid col-start-1 -col-end-1 row-start-1 -row-end-1 border-0 rounded-none")}
                    canvasClassName={cn(fullscreenState.isFullscreen && "col-start-1 -col-end-1 row-start-1 -row-end-1")}
                    buttonsContainerClassName={cn(fullscreenState.isFullscreen &&
                        "relative pointer-events-none z-20 col-start-1 col-end-3 row-start-1 row-end-2 md:col-start-2 xl:col-start-2 md:col-end-3 md:row-start-1 md:row-end-3 xl:row-end-2",
                        fullscreenState.isFullscreen && !configPanelEnabled && !conceptsPanelEnabled && "row-end-3 xl:col-end-4",
                        fullscreenState.isFullscreen && !conceptsPanelEnabled && "xl:col-start-1 md:col-start-1 row-end-3",
                        fullscreenState.isFullscreen && !configPanelEnabled && "md:col-start-1 xl:col-end-4 row-end-3")}
                    fullscreenState={fullscreenState}
                    conceptsPanelEnabled={conceptsPanelEnabled}
                    configPanelEnabled={configPanelEnabled}
                    setConceptsPanelEnabled={setConceptsPanelEnabled}
                    setConfigPanelEnabled={setConfigPanelEnabled} />
                <Config
                    className={cn(
                        "col-start-2 col-end-3 row-start-2 row-end-3 md:col-start-1 md:col-end-2 md:row-start-2 md:row-end-3 xl:col-start-3 xl:col-end-4 xl:row-start-1 xl:row-end-2",
                        "z-10",
                        fullscreenState.isFullscreen && "mt-0 mb-4 mr-4 md:mr-0 md:ml-4 xl:ml-0 xl:mr-4 xl:mt-4 shadow-lg",
                        fullscreenState.isFullscreen && !(configPanelEnabled && conceptsPanelEnabled) && "hidden xl:block",
                        fullscreenState.isFullscreen && !configPanelEnabled && "xl:hidden")} />
            </PageContainer>
        </ZoomActionsContextProvider>
    );
}

function Concepts(props: {
    className?: string,
}) {
    const visibleConceptIndexes = useDiagramStore((state) => state.visibleConceptIndexes);
    const selectedConceptIndex = useDiagramStore((state) => state.selectedConceptIndex);
    const filteredConcepts = useDiagramStore((state) => state.filteredConcepts);
    const searchTerms = useDiagramStore((state) => state.searchTerms);
    const debouncedSearchInput = useDiagramStore((state) => state.debouncedSearchInput);
    const setSelectedConceptIndex = useDiagramStore((state) => state.setSelectedConceptIndex);
    const updateSearchInput = useDiagramStore((state) => state.setDebouncedSearchInput);
    const sortType = useDiagramStore((state) => state.sortType);
    const sortDirection = useDiagramStore((state) => state.sortDirection);
    const setSortType = useDiagramStore((state) => state.setSortType);
    const setSortDirection = useDiagramStore((state) => state.setSortDirection);
    const selectedFilterObjects = useDiagramStore((state) => state.selectedFilterObjects);
    const selectedFilterAttributes = useDiagramStore((state) => state.selectedFilterAttributes);
    const minObjectsCount = useDiagramStore((state) => state.minObjectsCount);
    const maxObjectsCount = useDiagramStore((state) => state.maxObjectsCount);
    const minAttributesCount = useDiagramStore((state) => state.minAttributesCount);
    const maxAttributesCount = useDiagramStore((state) => state.maxAttributesCount);
    const setSelectedFilters = useDiagramStore((state) => state.setSelectedFilters);

    return (
        <ConceptsList
            className={props.className}
            route="/project/diagram"
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
            visibleConceptIndexes={visibleConceptIndexes}
            selectedFilterObjects={selectedFilterObjects}
            selectedFilterAttributes={selectedFilterAttributes}
            minObjectsCount={minObjectsCount}
            maxObjectsCount={maxObjectsCount}
            minAttributesCount={minAttributesCount}
            maxAttributesCount={maxAttributesCount}
            onSelectedFiltersChange={setSelectedFilters}
            controls={selectedConceptIndex !== null &&
                <ConceptDiagramControls
                    selectedConceptIndex={selectedConceptIndex}
                    visibleConceptIndexes={visibleConceptIndexes} />} />
    );
}

function Diagram(props: {
    className?: string,
    fullscreenState: FullscreenState,
    canvasClassName?: string,
    buttonsContainerClassName?: string,
    conceptsPanelEnabled: boolean,
    configPanelEnabled: boolean,
    setConceptsPanelEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setConfigPanelEnabled: React.Dispatch<React.SetStateAction<boolean>>,
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
                <DiagramCanvas
                    className={props.canvasClassName} />}
            <DiagramActions
                className={props.buttonsContainerClassName}
                fullscreenState={props.fullscreenState}
                conceptsPanelEnabled={props.conceptsPanelEnabled}
                configPanelEnabled={props.configPanelEnabled}
                toggleConceptsPanel={() => props.setConceptsPanelEnabled((old) => !old)}
                toggleConfigPanel={() => props.setConfigPanelEnabled((old) => !old)}
                toggleBothPanels={() => {
                    const newValue = !(props.conceptsPanelEnabled && props.configPanelEnabled);
                    props.setConceptsPanelEnabled(newValue);
                    props.setConfigPanelEnabled(newValue);
                }}
                showSpinner={!canRenderCanvas} />
        </Container>
    );
}

function Config(props: {
    className?: string,
}) {
    return (
        <Container
            as="section"
            className={cn("pt-3 flex flex-col overflow-hidden", props.className)}>
            <DiagramConfig />
        </Container>
    );
}