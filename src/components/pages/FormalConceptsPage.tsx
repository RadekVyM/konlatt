import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import { cn } from "../../utils/tailwind";
import Container from "../Container";
import ConceptsList from "../concepts/ConceptsList";

export default function FormalConceptsPage() {
    return (
        <div
            className="grid grid-cols-[1fr_1fr] grid-rows-[5fr_4fr] md:grid-rows-[6fr_4fr] md:grid-cols-[minmax(18rem,2fr)_5fr] xl:grid-cols-[2fr_5fr_1.5fr] xl:grid-rows-1 gap-3 flex-1 pb-4 max-h-full overflow-hidden">
            <ConceptsList />
            <Diagram
                className="col-start-1 col-end-3 row-start-1 row-end-2 md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-3 xl:row-end-2" />
            <Config />
        </div>
    );
}

function Diagram(props: {
    className?: string,
}) {
    const lattice = useConceptLatticeStore((state) => state.lattice);

    return (
        <Container
            as="section"
            className={cn("overflow-hidden", props.className)}>
            <p>Links count in the lattice: {lattice?.subconceptsMapping.reduce((prev, curr) => prev + curr.size, 0)}</p>
            <p>Links count in the lattice: {lattice?.superconceptsMapping.reduce((prev, curr) => prev + curr.size, 0)}</p>
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