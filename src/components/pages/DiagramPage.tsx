import { useMemo, useRef } from "react";
import { cn } from "../../utils/tailwind";
import Container from "../Container";
import ConceptsList from "../concepts/ConceptsList";
import ConceptsDiagram from "../concepts/ConceptsDiagram";
import PageContainer from "../PageContainer";
import useFullscreen from "../../hooks/useFullscreen";
import { FullscreenState } from "../../types/FullscreenState";
import { breadthFirstSearch } from "../../utils/graphs";
import DiagramConfig from "../concepts/DiagramConfig";
import useDataStructuresStore from "../../hooks/stores/useDataStructuresStore";
import { ZoomToContextProvider } from "../../contexts/ZoomToContext";
import useDiagramStore from "../../hooks/stores/useDiagramStore";
import ConceptDiagramControls from "../concepts/ConceptDiagramControls";

export default function DiagramPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedConceptIndex = useDiagramStore((state) => state.selectedConceptIndex);
    const upperConeOnlyConceptIndex = useDiagramStore((state) => state.upperConeOnlyConceptIndex);
    const lowerConeOnlyConceptIndex = useDiagramStore((state) => state.lowerConeOnlyConceptIndex);
    const setSelectedConceptIndex = useDiagramStore((state) => state.setSelectedConceptIndex);
    const fullscreenState = useFullscreen(containerRef);
    const visibleConceptIndexes = useVisibleConceptIndexes(upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex);

    return (
        <ZoomToContextProvider>
            <PageContainer
                ref={containerRef}
                className={cn(
                    "grid grid-cols-[1fr_1fr] grid-rows-[5fr_4fr] md:grid-rows-[6fr_4fr] md:grid-cols-[minmax(18rem,2fr)_5fr] xl:grid-cols-[1fr_2.5fr_1fr] xl:grid-rows-1 gap-2",
                    fullscreenState.isFullscreen && "bg-surface pt-4")}>
                <ConceptsList
                    route="/project/diagram"
                    selectedConceptIndex={selectedConceptIndex}
                    setSelectedConceptIndex={setSelectedConceptIndex}
                    visibleConceptIndexes={visibleConceptIndexes}
                    controls={selectedConceptIndex &&
                        <ConceptDiagramControls
                            selectedConceptIndex={selectedConceptIndex}
                            visibleConceptIndexes={visibleConceptIndexes} />} />
                <Diagram
                    className="col-start-1 col-end-3 row-start-1 row-end-2 md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-3 xl:row-end-2"
                    fullscreenState={fullscreenState}
                    visibleConceptIndexes={visibleConceptIndexes} />
                <Config />
            </PageContainer>
        </ZoomToContextProvider>
    );
}

function Diagram(props: {
    className?: string,
    fullscreenState: FullscreenState,
    visibleConceptIndexes: Set<number> | null,
}) {
    return (
        <Container
            as="section"
            className={cn("overflow-hidden relative", props.className)}>
            <ConceptsDiagram
                visibleConceptIndexes={props.visibleConceptIndexes}
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

function useVisibleConceptIndexes(upperConeOnlyConceptIndex: number | null, lowerConeOnlyConceptIndex: number | null) {
    const lattice = useDataStructuresStore((state) => state.lattice);

    return useMemo(() => {
        if (upperConeOnlyConceptIndex === null && lowerConeOnlyConceptIndex === null) {
            return null;
        }

        const upperCone = upperConeOnlyConceptIndex !== null && lattice?.superconceptsMapping ?
            collectIndexes(upperConeOnlyConceptIndex, lattice.superconceptsMapping) :
            null;
        
        const lowerCone = lowerConeOnlyConceptIndex !== null && lattice?.subconceptsMapping ?
            collectIndexes(lowerConeOnlyConceptIndex, lattice.subconceptsMapping) :
            null;

        if (upperCone === null) {
            return lowerCone;
        }
        if (lowerCone === null) {
            return upperCone;
        }

        const smaller = upperCone.size > lowerCone.size ? lowerCone : upperCone;
        const larger = upperCone.size > lowerCone.size ? upperCone : lowerCone;

        const intersection = new Array<number>();

        for (const conceptIndex of larger) {
            if (smaller.has(conceptIndex)) {
                intersection.push(conceptIndex);
            }
        }

        return new Set(intersection);
    }, [upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex, lattice?.subconceptsMapping, lattice?.superconceptsMapping]);
}

function collectIndexes(startIndex: number, relation: ReadonlyArray<Set<number>>) {
    const set = new Set<number>();

    breadthFirstSearch(startIndex, relation, (index) => set.add(index));

    return set;
}