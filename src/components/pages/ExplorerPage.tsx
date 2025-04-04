import { useEffect, useState } from "react";
import { cn } from "../../utils/tailwind";
import ConceptsList from "../concepts/ConceptsList";
import Container from "../Container";
import useProjectStore from "../../hooks/stores/useProjectStore";
import PageContainer from "../PageContainer";

export default function ExplorerPage() {
    const context = useProjectStore((state) => state.context);
    const [selectedConceptIndex, setSelectedConceptIndex] = useState<number | null>(null);

    useEffect(() => {
        setSelectedConceptIndex(null);
    }, [context]);

    return (
        <PageContainer
            className="grid grid-cols-1 grid-rows-[5fr_4fr] md:grid-rows-1 md:grid-cols-[minmax(18rem,2fr)_5fr] xl:grid-cols-[1fr_2.5fr_1fr] gap-2">
            <ConceptsList
                type="without-controls"
                route="/project/explorer"
                selectedConceptIndex={selectedConceptIndex}
                setSelectedConceptIndex={setSelectedConceptIndex} />
            <Diagram
                className="col-start-1 col-end-2 row-start-1 row-end-2 md:col-start-2 md:col-end-3 xl:col-end-4 md:row-start-1 md:row-end-2"
                selectedConceptIndex={selectedConceptIndex}
                setSelectedConceptIndex={setSelectedConceptIndex} />
        </PageContainer>
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

        </Container>
    );
}