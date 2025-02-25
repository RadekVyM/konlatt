import { LuMaximize, LuMinus, LuMove, LuPlus, LuRedo2, LuUndo2 } from "react-icons/lu";
import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import Button from "../inputs/Button";
import DiagramCanvas from "./DiagramCanvas";
import { cn } from "../../utils/tailwind";
import { useRef, useState } from "react";
import useEventListener from "../../hooks/useEventListener";
import { ZoomTransform } from "../../types/d3/ZoomTransform";
import useZoom from "../../hooks/useZoom";

export default function ConceptsDiagram(props: {
    selectedConceptIndex: number | null,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const context = useConceptLatticeStore((state) => state.context);
    const lattice = useConceptLatticeStore((state) => state.lattice);
    const layout = useConceptLatticeStore((state) => state.layout);
    const concepts = useConceptLatticeStore((state) => state.concepts);
    const [canMoveNodes, setCanMoveNodes] = useState(false);

    const { zoomTransform, updateExtent, zoomTo } = useZoom(canvasRef, !canMoveNodes, { min: 0.05, max: 4 });

    useEventListener("keydown", (event) => {
        setCanMoveNodes(event.key === "Control");
    });

    useEventListener("keyup", (event) => {
        setCanMoveNodes((old) => old && event.key !== "Control");
    });

    return (
        <>
            {context && lattice && layout && concepts &&
                <DiagramCanvas
                    ref={canvasRef}
                    className="w-full h-full"
                    layout={layout}
                    concepts={concepts}
                    lattice={lattice}
                    formalContext={context}
                    canMoveNodes={canMoveNodes}
                    zoomTransform={zoomTransform}
                    selectedConceptIndex={props.selectedConceptIndex}
                    setSelectedConceptIndex={props.setSelectedConceptIndex}
                    updateExtent={updateExtent} />}
            
            <FullscreenButton
                className="absolute top-0 right-0 m-3" />

            <div
                className="absolute bottom-0 left-0 m-3 flex gap-2">
                <ZoomBar
                    zoomTransform={zoomTransform}
                    zoomTo={zoomTo} />
                <UndoRedoBar />
            </div>

            <MoveToggle
                className="absolute bottom-0 right-0 m-3"
                selected={canMoveNodes}
                onToggle={() => setCanMoveNodes((old) => !old)} />
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
    zoomTransform: ZoomTransform,
    zoomTo: (transform: ZoomTransform) => void,
}) {
    const ZOOM_STEP = 0.1;

    function onIncrease() {
        props.zoomTo({
            ...props.zoomTransform,
            scale: (Math.ceil(props.zoomTransform.scale / ZOOM_STEP) * ZOOM_STEP) + ZOOM_STEP,
        });
    }

    function onDecrease() {
        props.zoomTo({
            ...props.zoomTransform,
            scale: (Math.floor(props.zoomTransform.scale / ZOOM_STEP) * ZOOM_STEP) - ZOOM_STEP,
        });
    }

    return (
        <div
            className={cn("flex items-center gap-1 bg-secondary rounded-md", props.className)}>
            <Button
                variant="icon-secondary"
                onClick={onDecrease}>
                <LuMinus />
            </Button>
            <span className="text-sm w-10 text-center">
                {Math.round(100 * props.zoomTransform.scale)}%
            </span>
            <Button
                variant="icon-secondary"
                onClick={onIncrease}>
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

function MoveToggle(props: {
    className?: string,
    selected: boolean,
    onToggle: () => void,
}) {
    return (
        <Button
            className={props.className}
            variant={props.selected ? "icon-primary" : "icon-secondary"}
            onClick={props.onToggle}>
            <LuMove />
        </Button>
    );
}