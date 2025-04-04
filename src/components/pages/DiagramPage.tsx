import { useEffect, useMemo, useRef, useState } from "react";
import useProjectStore from "../../hooks/stores/useProjectStore";
import { cn } from "../../utils/tailwind";
import Container from "../Container";
import ConceptsList from "../concepts/ConceptsList";
import ConceptsDiagram from "../concepts/ConceptsDiagram";
import PageContainer from "../PageContainer";
import useFullscreen from "../../hooks/useFullscreen";
import { FullscreenState } from "../../types/FullscreenState";
import { breadthFirstSearch } from "../../utils/graphs";

export default function DiagramPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const context = useProjectStore((state) => state.context);
    const [selectedConceptIndex, setSelectedConceptIndex] = useState<number | null>(null);
    const [upperConeOnlyConceptIndex, setUpperConeOnlyConceptIndex] = useState<number | null>(null);
    const [lowerConeOnlyConceptIndex, setLowerConeOnlyConceptIndex] = useState<number | null>(null);
    const fullscreenState = useFullscreen(containerRef);
    const visibleConceptIndexes = useVisibleConceptIndexes(upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex);

    useEffect(() => {
        setSelectedConceptIndex(null);
        setUpperConeOnlyConceptIndex(null);
        setLowerConeOnlyConceptIndex(null);
    }, [context]);

    return (
        <PageContainer
            ref={containerRef}
            className={cn(
                "grid grid-cols-[1fr_1fr] grid-rows-[5fr_4fr] md:grid-rows-[6fr_4fr] md:grid-cols-[minmax(18rem,2fr)_5fr] xl:grid-cols-[1fr_2.5fr_1fr] xl:grid-rows-1 gap-2",
                fullscreenState.isFullscreen && "bg-surface pt-4")}>
            <ConceptsList
                type="with-controls"
                route="/project/diagram"
                selectedConceptIndex={selectedConceptIndex}
                setSelectedConceptIndex={setSelectedConceptIndex}
                upperConeOnlyConceptIndex={upperConeOnlyConceptIndex}
                lowerConeOnlyConceptIndex={lowerConeOnlyConceptIndex}
                setUpperConeOnlyConceptIndex={setUpperConeOnlyConceptIndex}
                setLowerConeOnlyConceptIndex={setLowerConeOnlyConceptIndex}
                visibleConceptIndexes={visibleConceptIndexes} />
            <Diagram
                className="col-start-1 col-end-3 row-start-1 row-end-2 md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-3 xl:row-end-2"
                selectedConceptIndex={selectedConceptIndex}
                setSelectedConceptIndex={setSelectedConceptIndex}
                fullscreenState={fullscreenState}
                visibleConceptIndexes={visibleConceptIndexes} />
            <Config />
        </PageContainer>
    );
}

function Diagram(props: {
    className?: string,
    fullscreenState: FullscreenState,
    visibleConceptIndexes: Set<number> | null,
    selectedConceptIndex: number | null,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
}) {
    return (
        <Container
            as="section"
            className={cn("overflow-hidden relative", props.className)}>
            <ConceptsDiagram
                visibleConceptIndexes={props.visibleConceptIndexes}
                selectedConceptIndex={props.selectedConceptIndex}
                setSelectedConceptIndex={props.setSelectedConceptIndex}
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
            <header
                className="pb-3 flex flex-col">
                <h2
                    className="mx-4 mb-2 text-lg font-semibold">
                    Configuration
                </h2>
            </header>
        </Container>
    );
}

function useVisibleConceptIndexes(upperConeOnlyConceptIndex: number | null, lowerConeOnlyConceptIndex: number | null) {
    const lattice = useProjectStore((state) => state.lattice);

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