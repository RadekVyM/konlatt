import { useRef } from "react";
import { cn } from "../../utils/tailwind";
import Container from "../Container";
import ConceptsList from "../concepts/ConceptsList";
import ConceptsDiagram from "../concepts/diagram/ConceptsDiagram";
import PageContainer from "../PageContainer";
import useFullscreen from "../../hooks/useFullscreen";
import { FullscreenState } from "../../types/FullscreenState";
import DiagramConfig from "../concepts/diagram/DiagramConfig";
import { ZoomActionsContextProvider } from "../../contexts/ZoomActionsContext";
import useDiagramStore from "../../stores/useDiagramStore";
import ConceptDiagramControls from "../concepts/diagram/ConceptDiagramControls";

export default function DiagramPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const fullscreenState = useFullscreen(containerRef);

    return (
        <ZoomActionsContextProvider>
            <PageContainer
                ref={containerRef}
                className={cn(
                    "grid grid-cols-[1fr_1fr] grid-rows-[5fr_4fr] md:grid-rows-[6fr_4fr] md:grid-cols-[minmax(18rem,2fr)_5fr] xl:grid-cols-[1fr_2.5fr_1fr] xl:grid-rows-1 gap-2",
                    fullscreenState.isFullscreen && "bg-surface pt-4")}>
                <Concepts />
                <Diagram
                    className="col-start-1 col-end-3 row-start-1 row-end-2 md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-3 xl:row-end-2"
                    fullscreenState={fullscreenState} />
                <Config />
            </PageContainer>
        </ZoomActionsContextProvider>
    );
}

function Concepts() {
    const visibleConceptIndexes = useDiagramStore((state) => state.visibleConceptIndexes);
    const selectedConceptIndex = useDiagramStore((state) => state.selectedConceptIndex);
    const filteredConcepts = useDiagramStore((state) => state.filteredConcepts);
    const searchTerms = useDiagramStore((state) => state.searchTerms);
    const debouncedSearchInput = useDiagramStore((state) => state.debouncedSearchInput);
    const setSelectedConceptIndex = useDiagramStore((state) => state.setSelectedConceptIndex);
    const updateSearchInput = useDiagramStore((state) => state.setDebouncedSearchInput);

    return (
        <ConceptsList
            route="/project/diagram"
            selectedConceptIndex={selectedConceptIndex}
            setSelectedConceptIndex={setSelectedConceptIndex}
            updateSearchInput={updateSearchInput}
            filteredConcepts={filteredConcepts}
            searchTerms={searchTerms}
            storedSearchInput={debouncedSearchInput}
            visibleConceptIndexes={visibleConceptIndexes}
            controls={selectedConceptIndex !== null &&
                <ConceptDiagramControls
                    selectedConceptIndex={selectedConceptIndex}
                    visibleConceptIndexes={visibleConceptIndexes} />} />
    );
}

function Diagram(props: {
    className?: string,
    fullscreenState: FullscreenState,
}) {
    return (
        <Container
            as="section"
            className={cn("overflow-hidden relative", props.className)}>
            <ConceptsDiagram
                fullscreenState={props.fullscreenState} />
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