import { LuMaximize, LuMinus, LuPlus, LuRedo2, LuUndo2 } from "react-icons/lu";
import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import Button from "../inputs/Button";
import DiagramCanvas from "./DiagramCanvas";
import { cn } from "../../utils/tailwind";

export default function ConceptsDiagram(props: {
    selectedConceptIndex: number | null,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
}) {
    const context = useConceptLatticeStore((state) => state.context);
    const lattice = useConceptLatticeStore((state) => state.lattice);
    const layout = useConceptLatticeStore((state) => state.layout);
    const concepts = useConceptLatticeStore((state) => state.concepts);

    return (
        <>
            {context && lattice && layout && concepts &&
                <DiagramCanvas
                    className="w-full h-full"
                    layout={layout}
                    concepts={concepts}
                    lattice={lattice}
                    formalContext={context}
                    selectedConceptIndex={props.selectedConceptIndex}
                    setSelectedConceptIndex={props.setSelectedConceptIndex} />}
            
            <FullscreenButton
                className="absolute top-0 right-0 m-3" />

            <div
                className="absolute bottom-0 left-0 m-3 flex gap-2">
                <ZoomBar />
                <UndoRedoBar />
            </div>
        </>
    );
}

function FullscreenButton(props: {
    className?: string,
}) {
    return (
        <Button
            className={props.className}
            variant="icon-secondary">
            <LuMaximize />
        </Button>
    );
}

function ZoomBar(props: {
    className?: string,
}) {
    return (
        <div
            className={cn("flex items-center gap-1 bg-secondary rounded-md", props.className)}>
            <Button
                variant="icon-secondary">
                <LuMinus />
            </Button>
            <span className="text-sm">
                100%
            </span>
            <Button
                variant="icon-secondary">
                <LuPlus />
            </Button>
        </div>
    );
}

function UndoRedoBar(props: {
    className?: string,
}) {
    return (
        <div
            className={cn("flex items-center bg-secondary rounded-md", props.className)}>
            <Button
                variant="icon-secondary">
                <LuUndo2 />
            </Button>
            <Button
                variant="icon-secondary">
                <LuRedo2 />
            </Button>
        </div>
    );
}