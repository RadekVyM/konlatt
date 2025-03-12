import { LuHand, LuMaximize, LuMinus, LuPlus, LuRedo2, LuUndo2 } from "react-icons/lu";
import useProjectStore from "../../hooks/stores/useProjectStore";
import Button from "../inputs/Button";
import DiagramCanvas from "./DiagramCanvas";
import { cn } from "../../utils/tailwind";
import { useRef, useState } from "react";
import useEventListener from "../../hooks/useEventListener";
import { ZoomTransform } from "../../types/d3/ZoomTransform";
import useZoom from "../../hooks/useZoom";
import { ZoomScaleExtent } from "../../types/d3/ZoomScaleExtent";
import { useDiagramOffsets } from "../../hooks/useDiagramOffsets";
import { isCtrlZ, isEditableElement } from "../../utils/html";

const ZOOM_SCALE_EXTENT: ZoomScaleExtent = { min: 0.05, max: 4 };

export default function ConceptsDiagram(props: {
    selectedConceptIndex: number | null,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isTemporarilyEditableRef = useRef<boolean>(true);
    const context = useProjectStore((state) => state.context);
    const lattice = useProjectStore((state) => state.lattice);
    const layout = useProjectStore((state) => state.layout);
    const concepts = useProjectStore((state) => state.concepts);
    const [isEditable, setIsEditable] = useState(false);
    const { diagramOffsets, canUndo, canRedo, updateNodeOffset, undo, redo } = useDiagramOffsets();

    const { zoomTransform, isDragZooming, updateExtent, zoomTo } = useZoom(canvasRef, !isEditable, ZOOM_SCALE_EXTENT);

    useKeyBoardEvents(isTemporarilyEditableRef, setIsEditable, undo, redo);

    return (
        <>
            {context && lattice && layout && concepts && diagramOffsets &&
                <DiagramCanvas
                    ref={canvasRef}
                    className="w-full h-full"
                    layout={layout}
                    concepts={concepts}
                    lattice={lattice}
                    formalContext={context}
                    isEditable={isEditable}
                    isDragZooming={isDragZooming}
                    zoomTransform={zoomTransform}
                    selectedConceptIndex={props.selectedConceptIndex}
                    setSelectedConceptIndex={props.setSelectedConceptIndex}
                    updateExtent={updateExtent}
                    diagramOffsets={diagramOffsets}
                    updateNodeOffset={updateNodeOffset} />}
            
            <FullscreenButton
                className="absolute top-0 right-0 m-3" />

            <div
                className="absolute bottom-0 left-0 m-3 flex gap-2">
                <ZoomBar
                    zoomTransform={zoomTransform}
                    zoomTo={zoomTo} />
                <UndoRedoBar
                    canUndo={canUndo}
                    canRedo={canRedo}
                    redo={redo}
                    undo={undo} />
            </div>

            <MoveToggle
                className="absolute bottom-0 right-0 m-3"
                selected={isEditable}
                onToggle={() => setIsEditable((old) => {
                    isTemporarilyEditableRef.current = old;
                    return !old;
                })} />
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
            scale: Math.min(ZOOM_SCALE_EXTENT.max || 1, (Math.ceil(props.zoomTransform.scale / ZOOM_STEP) * ZOOM_STEP) + ZOOM_STEP),
        });
    }

    function onDecrease() {
        props.zoomTo({
            ...props.zoomTransform,
            scale: Math.max(ZOOM_SCALE_EXTENT.min || 0, (Math.floor(props.zoomTransform.scale / ZOOM_STEP) * ZOOM_STEP) - ZOOM_STEP),
        });
    }

    return (
        <div
            className={cn("flex items-center gap-1 bg-secondary rounded-md", props.className)}>
            <Button
                variant="icon-secondary"
                title="Zoom out"
                onClick={onDecrease}
                disabled={props.zoomTransform.scale <= (ZOOM_SCALE_EXTENT.min || 0)}>
                <LuMinus />
            </Button>
            <span className="text-sm w-10 text-center">
                {Math.round(100 * props.zoomTransform.scale)}%
            </span>
            <Button
                variant="icon-secondary"
                title="Zoom in"
                onClick={onIncrease}
                disabled={props.zoomTransform.scale >= (ZOOM_SCALE_EXTENT.max || 0)}>
                <LuPlus />
            </Button>
        </div>
    );
}

function UndoRedoBar(props: {
    className?: string,
    canUndo: boolean,
    canRedo: boolean,
    undo: () => void,
    redo: () => void,
}) {
    return (
        <div
            className={cn("flex items-center bg-secondary rounded-md", props.className)}>
            <Button
                variant="icon-secondary"
                title="Undo"
                disabled={!props.canUndo}
                onClick={props.undo}>
                <LuUndo2 />
            </Button>
            <Button
                variant="icon-secondary"
                title="Redo"
                disabled={!props.canRedo}
                onClick={props.redo}>
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
            onClick={props.onToggle}
            type="button"
            role="switch"
            aria-checked={props.selected}
            title="Enable node movements">
            <LuHand />
        </Button>
    );
}

function useKeyBoardEvents(
    isTemporarilyEditableRef: React.RefObject<boolean>,
    setIsEditable: React.Dispatch<React.SetStateAction<boolean>>,
    undo: () => void,
    redo: () => void,
) {
    useEventListener("keydown", (event) => {
        if (window.document.activeElement && isEditableElement(window.document.activeElement)) {
            return;
        }

        if (event.ctrlKey && isTemporarilyEditableRef.current) {
            setIsEditable(true);
        }

        if (isCtrlZ(event)) {
            event.preventDefault();

            if (event.shiftKey) {
                redo();
            }
            if (!event.shiftKey) {
                undo();
            }
        }
    });

    useEventListener("keyup", (event) => {
        if (window.document.activeElement && isEditableElement(window.document.activeElement)) {
            return;
        }
        if (!event.ctrlKey && isTemporarilyEditableRef.current) {
            setIsEditable(false);
        }
    });
}