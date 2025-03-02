import { useEffect, useState } from "react";
import useProjectStore from "../../hooks/stores/useProjectStore";
import { cn } from "../../utils/tailwind";
import Container from "../Container";
import ContextTable from "../context/ContextTable";
import ObjectsList from "../context/ObjectsList";
import AttributesList from "../context/AttributesList";
import NothingFound from "../NothingFound";
import CardSectionTitle from "../CardSectionTitle";
import ExportButton from "../ExportButton";

export default function FormalContextPage() {
    const context = useProjectStore((state) => state.context);
    const [selectedObject, setSelectedObject] = useState<number | null>(null);
    const [selectedAttribute, setSelectedAttribute] = useState<number | null>(null);

    useEffect(() => {
        setSelectedObject(null);
        setSelectedAttribute(null);
    }, [context]);

    return (
        <div className="
            grid gap-2
            grid-rows-[4fr_3fr] grid-cols-[1fr_1fr]
            md:grid-rows-[1fr_1fr] md:grid-cols-[5fr_3fr]
            lg:grid-rows-1 lg:grid-cols-[5fr_2fr_2fr]
            flex-1 pb-4 max-h-full overflow-hidden">
            <Context
                className="col-start-1 col-end-3 md:col-end-2 md:row-start-1 md:row-end-3 lg:row-auto"
                selectedObject={selectedObject}
                selectedAttribute={selectedAttribute}
                setSelectedObject={setSelectedObject}
                setSelectedAttribute={setSelectedAttribute} />

            <ObjectsList
                className="lg:col-start-2 lg:col-end-3 lg:min-w-48"
                selectedObjectIndex={selectedObject}
                setSelectedObjectIndex={setSelectedObject} />
            <AttributesList
                className="lg:col-start-3 lg:col-end-4 lg:min-w-48"
                selectedAttributeIndex={selectedAttribute}
                setSelectedAttributeIndex={setSelectedAttribute} />
        </div>
    );
}

function Context(props: {
    selectedObject: number | null,
    selectedAttribute: number | null,
    className?: string,
    setSelectedObject: React.Dispatch<React.SetStateAction<number | null>>,
    setSelectedAttribute: React.Dispatch<React.SetStateAction<number | null>>,
}) {
    const context = useProjectStore((state) => state.context);

    return (
        <Container
            as="section"
            className={cn("flex flex-col overflow-hidden", props.className)}>
            <header
                className="flex justify-between items-center pt-3 pb-2 border-b border-outline-variant">
                <CardSectionTitle className="mx-4">Context</CardSectionTitle>
                <ExportButton
                    className="mr-4" />
            </header>
            {context ?
                <ContextTable
                    className="flex-1 animate-fadeIn"
                    selectedObject={props.selectedObject}
                    selectedAttribute={props.selectedAttribute}
                    setSelectedObject={props.setSelectedObject}
                    setSelectedAttribute={props.setSelectedAttribute}
                    context={context} /> :
                <NothingFound
                    className="flex-1" />}
        </Container>
    );
}