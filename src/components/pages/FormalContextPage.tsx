import { useRef } from "react";
import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import useLazyListCount from "../../hooks/useLazyListCount";
import { cn } from "../../utils/tailwind";
import Container from "../Container";
import ContextTable from "../context/ContextTable";

export default function ExportPage() {
    return (
        <div className="grid grid-cols-[1fr_1fr] grid-rows-[3fr_2fr] lg:grid-rows-1 lg:grid-cols-[3fr_1fr_1fr] gap-3 flex-1 pb-4 max-h-full overflow-hidden">
            <Context
                className="col-start-1 col-end-3 lg:col-end-2" />

            <Objects
                className="lg:col-start-2 lg:col-end-3 lg:min-w-48" />
            <Attributes
                className="lg:col-start-3 lg:col-end-4 lg:min-w-48" />
        </div>
    );
}

function Context(props: {
    className?: string,
}) {
    const context = useConceptLatticeStore((state) => state.context);

    return (
        <Container
            as="section"
            className={cn("flex flex-col overflow-hidden", props.className)}>
            {context ?
                <ContextTable
                    className="flex-1"
                    context={context} /> :
                <>nothing</>}
        </Container>
    );
}

function Objects(props: {
    className?: string,
}) {
    const context = useConceptLatticeStore((state) => state.context);
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const [objectsCount] = useLazyListCount(context?.objects.length || 0, 20, observerTargetRef);
    const objects = context?.objects.slice(0, objectsCount) || [];

    return (
        <Container
            as="section"
            className={cn("pt-3 overflow-y-auto thin-scrollbar", props.className)}>
            <CardTitle>Objects</CardTitle>

            <ul className="px-4">
                {objects.map((o) =>
                    <li
                        key={o}>
                        {o}
                    </li>)}
            </ul>

            <div ref={observerTargetRef}></div>
        </Container>
    );
}

function Attributes(props: {
    className?: string,
}) {
    const context = useConceptLatticeStore((state) => state.context);
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const [attributesCount] = useLazyListCount(context?.attributes.length || 0, 20, observerTargetRef);
    const attributes = context?.attributes.slice(0, attributesCount) || [];

    return (
        <Container
            as="section"
            className={cn("pt-3 overflow-y-auto thin-scrollbar", props.className)}>
            <CardTitle>Attributes</CardTitle>

            <ul className="px-4">
                {attributes.map((a) =>
                    <li
                        key={a}>
                        {a}
                    </li>)}
            </ul>

            <div ref={observerTargetRef}></div>
        </Container>
    );
}

function CardTitle(props: {
    children: React.ReactNode
}) {
    return (
        <h2
            className="mx-4 mb-2 text-lg font-semibold">
            {props.children}
        </h2>
    );
}