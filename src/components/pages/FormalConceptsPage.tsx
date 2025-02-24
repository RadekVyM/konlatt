import { useEffect, useState } from "react";
import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import { cn } from "../../utils/tailwind";
import Container from "../Container";
import ConceptsList from "../concepts/ConceptsList";
import ConceptsDiagram from "../concepts/ConceptsDiagram";

export default function FormalConceptsPage() {
    const context = useConceptLatticeStore((state) => state.context);
    const [selectedConceptIndex, setSelectedConceptIndex] = useState<number | null>(null);

    useEffect(() => {
        setSelectedConceptIndex(null);
    }, [context]);

    return (
        <div
            className="grid grid-cols-[1fr_1fr] grid-rows-[5fr_4fr] md:grid-rows-[6fr_4fr] md:grid-cols-[minmax(18rem,2fr)_5fr] xl:grid-cols-[1fr_2.5fr_1fr] xl:grid-rows-1 gap-3 flex-1 pb-4 max-h-full overflow-hidden">
            <ConceptsList
                selectedConceptIndex={selectedConceptIndex}
                setSelectedConceptIndex={setSelectedConceptIndex} />
            <Diagram
                className="col-start-1 col-end-3 row-start-1 row-end-2 md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-3 xl:row-end-2"
                selectedConceptIndex={selectedConceptIndex}
                setSelectedConceptIndex={setSelectedConceptIndex} />
            <Config />
        </div>
    );
}

function Diagram(props: {
    className?: string,
    selectedConceptIndex: number | null,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
}) {
    return (
        <Container
            as="section"
            className={cn("overflow-hidden relative", props.className)}>
            <ConceptsDiagram
                selectedConceptIndex={props.selectedConceptIndex}
                setSelectedConceptIndex={props.setSelectedConceptIndex} />
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