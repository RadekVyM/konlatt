import { LuFocus, LuHand, LuLoaderCircle, LuMaximize, LuMinimize, LuMinus, LuPlus, LuRedo2, LuUndo2 } from "react-icons/lu";
import Button from "../../inputs/Button";
import DiagramCanvas from "./R3FDiagramCanvas";
import { cn } from "../../../utils/tailwind";
import { useContext, useEffect, useRef, useState } from "react";
import useEventListener from "../../../hooks/useEventListener";
import { useDiagramOffsets } from "../../../hooks/useDiagramOffsets";
import { isCtrlZ, isEditableElement } from "../../../utils/html";
import { FullscreenState } from "../../../types/FullscreenState";
import ExportButton from "../../export/ExportButton";
import useDiagramStore from "../../../stores/useDiagramStore";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import { ZoomActionsContext } from "../../../contexts/ZoomActionsContext";

const ZOOM_STEP = 0.1;

export default function ConceptsDiagram(props: {
    fullscreenState: FullscreenState,
}) {
    const isTemporarilyEditableRef = useRef<boolean>(true);
    const context = useDataStructuresStore((state) => state.context);
    const lattice = useDataStructuresStore((state) => state.lattice);
    const concepts = useDataStructuresStore((state) => state.concepts);
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const [canRenderCanvas, setCanRenderCanvas] = useState<boolean>(false);

    const isDiagramRenderable = !!(context && lattice && concepts && layout && diagramOffsets);

    useEffect(() => {
        const timeoutId = setTimeout(() => setCanRenderCanvas(true), 500);
        return () => clearTimeout(timeoutId);
    }, []);

    useKeyBoardEvents(isTemporarilyEditableRef);

    return (
        <>
            {canRenderCanvas &&
                <DiagramCanvas />}
            {(!canRenderCanvas || !isDiagramRenderable) &&
                <div
                    className="w-full h-full grid place-content-center">
                    <LuLoaderCircle
                        className="animate-spin w-8 h-8 text-on-surface-muted" />
                </div>}

            <ExportButton
                className="absolute top-0 right-0 m-3"
                isHighlighted
                route="/project/diagram/export" />

            <div
                className="absolute bottom-0 left-0 m-3 flex gap-2">
                <UndoRedoBar />
                <MoveToggle
                    isTemporarilyEditableRef={isTemporarilyEditableRef} />
            </div>

            <div
                className="absolute bottom-0 right-0 m-3 flex gap-2">
                <ZoomBar />    
                <ZoomToCenterButton />

                <FullscreenButton
                    fullscreenState={props.fullscreenState} />
            </div>
        </>
    );
}

function FullscreenButton(props: {
    className?: string,
    fullscreenState: FullscreenState,
}) {
    if (!props.fullscreenState.isFullscreenEnabled) {
        return undefined;
    }

    return (
        <Button
            className={props.className}
            title={props.fullscreenState.isFullscreen ? "Exit full screen" : "Full screen"}
            variant="icon-secondary"
            onClick={props.fullscreenState.toggleFullscreen}>
            {props.fullscreenState.isFullscreen ?
                <LuMinimize /> :
                <LuMaximize />}
        </Button>
    );
}

function ZoomToCenterButton(props: {
    className?: string,
}) {
    const zoomActionsRef = useContext(ZoomActionsContext);
    /*
    disabled={props.zoomTransform.scale === 1 && props.zoomTransform.x === 0 &&  props.zoomTransform.y === 0}
    onClick={() => props.zoomTo({ scale: 1, x: 0, y: 0 })}
    */

    return (
        <Button
            className={props.className}
            title="Zoom to center"
            variant="icon-secondary"
            onClick={() => zoomActionsRef.current?.reset()}>
            <LuFocus />
        </Button>
    );
}

function ZoomBar(props: {
    className?: string,
}) {
    const zoomActionsRef = useContext(ZoomActionsContext);
    const currentZoomLevel = useDiagramStore((state) => state.currentZoomLevel);

    function onIncrease() {
        zoomActionsRef.current?.zoomBy(ZOOM_STEP);
    }

    function onDecrease() {
        zoomActionsRef.current?.zoomBy(-ZOOM_STEP);
    }

/*
    disabled={props.zoomTransform.scale <= (ZOOM_SCALE_EXTENT.min || 0)}
    {Math.round(100 * props.zoomTransform.scale)}%
    disabled={props.zoomTransform.scale >= (ZOOM_SCALE_EXTENT.max || 0)}
*/

    return (
        <div
            className={cn("flex items-center gap-1 bg-secondary rounded-md", props.className)}>
            <Button
                variant="icon-secondary"
                title="Zoom out"
                onClick={onDecrease}>
                <LuMinus />
            </Button>
            <span className="text-sm w-10 text-center">
                {Math.round(100 * currentZoomLevel)}%
            </span>
            <Button
                variant="icon-secondary"
                title="Zoom in"
                onClick={onIncrease}>
                <LuPlus />
            </Button>
        </div>
    );
}

function UndoRedoBar(props: {
    className?: string,
}) {
    const { canUndo, canRedo, undo, redo } = useDiagramOffsets();

    return (
        <div
            className={cn("flex items-center bg-secondary rounded-md", props.className)}>
            <Button
                variant="icon-secondary"
                title="Undo"
                disabled={!canUndo}
                onClick={undo}>
                <LuUndo2 />
            </Button>
            <Button
                variant="icon-secondary"
                title="Redo"
                disabled={!canRedo}
                onClick={redo}>
                <LuRedo2 />
            </Button>
        </div>
    );
}

function MoveToggle(props: {
    className?: string,
    isTemporarilyEditableRef: React.RefObject<boolean>,
}) {
    const editingEnabled = useDiagramStore((state) => state.editingEnabled);
    const setEditingEnabled = useDiagramStore((state) => state.setEditingEnabled);

    function onClick() {
        setEditingEnabled((old) => {
            props.isTemporarilyEditableRef.current = old;
            return !old;
        });
    }

    return (
        <Button
            className={props.className}
            variant={editingEnabled ? "icon-primary" : "icon-secondary"}
            onClick={onClick}
            type="button"
            role="switch"
            aria-checked={editingEnabled}
            title={editingEnabled ? "Disable node movement" : "Enable node movement"}>
            <LuHand />
        </Button>
    );
}

function useKeyBoardEvents(
    isTemporarilyEditableRef: React.RefObject<boolean>,
) {
    const { undo, redo } = useDiagramOffsets();
    const setEditingEnabled = useDiagramStore((state) => state.setEditingEnabled);

    useEventListener("keydown", (event) => {
        if (window.document.activeElement && isEditableElement(window.document.activeElement)) {
            return;
        }

        if (event.ctrlKey && isTemporarilyEditableRef.current) {
            setEditingEnabled(true);
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
            setEditingEnabled(false);
        }
    });
}