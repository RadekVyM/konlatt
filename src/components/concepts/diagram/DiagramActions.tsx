import { LuFocus, LuGrid3X3, LuHand, LuMaximize, LuMinimize, LuPanelBottomClose, LuPanelBottomOpen, LuPanelLeftClose, LuPanelLeftOpen, LuPanelRightClose, LuPanelRightOpen, LuRedo2, LuSquareDashedMousePointer, LuUndo2 } from "react-icons/lu";
import Button from "../../inputs/Button";
import { cn } from "../../../utils/tailwind";
import { useContext, useRef } from "react";
import useEventListener from "../../../hooks/useEventListener";
import { isCtrl, isCtrlZ, isEditableElement, isMac } from "../../../utils/html";
import { FullscreenState } from "../../../types/FullscreenState";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import { DiagramZoomActionsContext } from "../../../contexts/DiagramZoomActionsContext";
import ExportDiagramButton from "../../export/diagram/ExportDiagramButton";
import ZoomBar from "../../ZoomBar";
import DiagramLoadingSpinner from "./DiagramLoadingSpinner";

const ZOOM_STEP = 0.1;

type PanelToggleButtonProps = {
    className?: string,
    title: string,
    panelEnabled: boolean,
    onClick: () => void,
}

export default function DiagramActions(props: {
    className?: string,
    showSpinner?: boolean,
    fullscreenState: FullscreenState,
    conceptsPanelEnabled: boolean,
    configPanelEnabled: boolean,
    toggleConceptsPanel: () => void,
    toggleConfigPanel: () => void,
    toggleBothPanels: () => void,
}) {
    const isTemporarilyEditableRef = useRef<boolean>(true);
    const isTemporarilyMultiselectEnabledRef = useRef<boolean>(true);
    const context = useDataStructuresStore((state) => state.context);
    const lattice = useDataStructuresStore((state) => state.lattice);
    const concepts = useDataStructuresStore((state) => state.concepts);
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);

    const isDiagramRenderable = !!(context && lattice && concepts && layout && diagramOffsets);

    useKeyBoardEvents(isTemporarilyEditableRef, isTemporarilyMultiselectEnabledRef);

    return (
        <div
            className={props.className}>
            {(props.showSpinner || !isDiagramRenderable) &&
                <div
                    className="absolute inset-0 grid place-content-center">
                    <DiagramLoadingSpinner />
                </div>}

            {props.fullscreenState.isFullscreen && 
                <LeftPanelToggle
                    className="hidden xl:grid pointer-events-auto my-4 mx-4 md:mx-3"
                    title={props.conceptsPanelEnabled ? "Hide concepts panel" : "Show concepts panel"}
                    panelEnabled={props.conceptsPanelEnabled}
                    onClick={props.toggleConceptsPanel} />}

            {props.fullscreenState.isFullscreen && 
                <LeftPanelToggle
                    className="hidden md:grid xl:hidden pointer-events-auto my-4 mx-4 md:mx-3"
                    title={props.conceptsPanelEnabled ? "Hide panels" : "Show panels"}
                    panelEnabled={props.conceptsPanelEnabled && props.configPanelEnabled}
                    onClick={props.toggleBothPanels} />}

            <div
                className={cn(
                    "absolute top-0 right-0 flex gap-2 pointer-events-auto",
                    props.fullscreenState.isFullscreen ? "my-4 mx-4 md:mx-3" : "m-3")}>
                <ExportDiagramButton
                    route="/project/diagram/export" />
                
                {props.fullscreenState.isFullscreen &&
                    <RightPanelToggle
                        className="hidden xl:grid"
                        title={props.configPanelEnabled ? "Hide configuration panel" : "Show configuration panel"}
                        panelEnabled={props.configPanelEnabled}
                        onClick={props.toggleConfigPanel} />}
            </div>

            <div
                className={cn(
                    "absolute bottom-0 left-0 flex gap-2 pointer-events-auto",
                    props.fullscreenState.isFullscreen ? "my-4 mx-4 md:mx-3" : "m-3")}>
                <UndoRedoBar />
                <MoveToggle
                    isTemporarilyEditableRef={isTemporarilyEditableRef} />
                <MultiselectToggle
                    isTemporarilyMultiselectEnabledRef={isTemporarilyMultiselectEnabledRef} />
                <GridToggle />
            </div>

            <div
                className={cn(
                    "absolute bottom-0 right-0 flex gap-2 pointer-events-auto",
                    props.fullscreenState.isFullscreen ? "my-4 mx-4 md:mx-3" : "m-3")}>
                {props.fullscreenState.isFullscreen &&
                    <BottomPanelToggle
                        className="md:hidden"
                        title={props.configPanelEnabled ? "Hide panels" : "Show panels"}
                        panelEnabled={props.conceptsPanelEnabled && props.configPanelEnabled}
                        onClick={props.toggleBothPanels} />}

                <DiagramZoomBar />    
                <ZoomToCenterButton />

                <FullscreenButton
                    fullscreenState={props.fullscreenState} />
            </div>
        </div>
    );
}

function PanelToggleButton(props: {
    children: React.ReactNode,
} & PanelToggleButtonProps) {
    return (
        <Button
            className={props.className}
            title={props.title}
            variant="icon-secondary"
            onClick={props.onClick}>
            {props.children}
        </Button>
    );
}

function BottomPanelToggle(props: PanelToggleButtonProps) {
    return (
        <PanelToggleButton
            {...props}>
            {props.panelEnabled ?
                <LuPanelBottomClose /> :
                <LuPanelBottomOpen />}
        </PanelToggleButton>
    );
}

function LeftPanelToggle(props: PanelToggleButtonProps) {
    return (
        <PanelToggleButton
            {...props}>
            {props.panelEnabled ?
                <LuPanelLeftClose /> :
                <LuPanelLeftOpen />}
        </PanelToggleButton>
    );
}

function RightPanelToggle(props: PanelToggleButtonProps) {
    return (
        <PanelToggleButton
            {...props}>
            {props.panelEnabled ?
                <LuPanelRightClose /> :
                <LuPanelRightOpen />}
        </PanelToggleButton>
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
            shortcutKeys="F"
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
    const zoomActionsRef = useContext(DiagramZoomActionsContext);
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

function DiagramZoomBar(props: {
    className?: string,
}) {
    const zoomActionsRef = useContext(DiagramZoomActionsContext);
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
        <ZoomBar
            className={props.className}
            currentZoomLevel={currentZoomLevel}
            onDecreaseClick={onDecrease}
            onIncreaseClick={onIncrease} />
    );
}

function UndoRedoBar(props: {
    className?: string,
}) {
    const canUndo = useDiagramStore((state) => state.canUndo);
    const canRedo = useDiagramStore((state) => state.canRedo);
    const undo = useDiagramStore((state) => state.undo);
    const redo = useDiagramStore((state) => state.redo);

    return (
        <div
            className={cn("flex items-center bg-secondary rounded-md", props.className)}>
            <Button
                variant="icon-secondary"
                title="Undo"
                disabled={!canUndo}
                onClick={undo}
                shortcutKeys={`${ctrlKey()}+Z`}>
                <LuUndo2 />
            </Button>
            <Button
                variant="icon-secondary"
                title="Redo"
                disabled={!canRedo}
                onClick={redo}
                shortcutKeys={`${ctrlKey()}+Shift+Z`}>
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
        <Toggle
            className={props.className}
            checked={editingEnabled}
            onClick={onClick}
            checkedTitle="Disable node movement"
            uncheckedTitle="Enable node movement"
            shortcutKeys={ctrlKey()}>
            <LuHand />
        </Toggle>
    );
}

function GridToggle(props: {
    className?: string,
}) {
    const editingEnabled = useDiagramStore((state) => state.editingEnabled);
    const gridWhileEditingEnabled = useDiagramStore((state) => state.gridWhileEditingEnabled);
    const setGridWhileEditingEnabled = useDiagramStore((state) => state.setGridWhileEditingEnabled);

    function onClick() {
        setGridWhileEditingEnabled((old) => !old);
    }

    if (!editingEnabled) {
        return undefined;
    }

    return (
        <Toggle
            className={props.className}
            onClick={onClick}
            checked={gridWhileEditingEnabled}
            checkedTitle="Disable grid"
            uncheckedTitle="Enable grid">
            <LuGrid3X3 />
        </Toggle>
    );
}

function MultiselectToggle(props: {
    className?: string,
    isTemporarilyMultiselectEnabledRef: React.RefObject<boolean>,
}) {
    const editingEnabled = useDiagramStore((state) => state.editingEnabled);
    const multiselectEnabled = useDiagramStore((state) => state.multiselectEnabled);
    const setMultiselectEnabled = useDiagramStore((state) => state.setMultiselectEnabled);

    function onClick() {
        setMultiselectEnabled((old) => {
            props.isTemporarilyMultiselectEnabledRef.current = old;
            return !old;
        });
    }

    if (!editingEnabled) {
        return undefined;
    }

    return (
        <Toggle
            className={props.className}
            onClick={onClick}
            checked={multiselectEnabled}
            checkedTitle="Disable node multi-selection"
            uncheckedTitle="Enable node multi-selection"
            shortcutKeys="Shift">
            <LuSquareDashedMousePointer />
        </Toggle>
    );
}

function Toggle(props: {
    checked: boolean,
    checkedTitle?: string,
    uncheckedTitle?: string,
    shortcutKeys?: string,
    className?: string,
    children?: React.ReactNode,
    onClick?: React.MouseEventHandler<HTMLButtonElement>, 
}) {
    return (
        <Button
            className={props.className}
            variant={props.checked ? "icon-primary" : "icon-secondary"}
            onClick={props.onClick}
            type="button"
            role="switch"
            aria-checked={props.checked}
            title={props.checked ? props.checkedTitle : props.uncheckedTitle}
            shortcutKeys={props.shortcutKeys}>
            {props.children}
        </Button>
    );
}

function useKeyBoardEvents(
    isTemporarilyEditableRef: React.RefObject<boolean>,
    isTemporarilyMultiselectEnabledRef: React.RefObject<boolean>,
) {
    const undo = useDiagramStore((state) => state.undo);
    const redo = useDiagramStore((state) => state.redo);
    const setEditingEnabled = useDiagramStore((state) => state.setEditingEnabled);
    const setMultiselectEnabled = useDiagramStore((state) => state.setMultiselectEnabled);

    useEventListener("keydown", (event) => {
        if (window.document.activeElement && isEditableElement(window.document.activeElement)) {
            return;
        }

        if (isCtrl(event) && isTemporarilyEditableRef.current) {
            setEditingEnabled(true);
        }

        if (event.shiftKey && isTemporarilyMultiselectEnabledRef.current) {
            setMultiselectEnabled(true);
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
        if (!isCtrl(event) && isTemporarilyEditableRef.current) {
            setEditingEnabled(false);
        }
        if (!event.shiftKey && isTemporarilyMultiselectEnabledRef.current) {
            setMultiselectEnabled(false);
        }
    });

    useEventListener("blur", () => {
        if (isTemporarilyEditableRef.current) {
            setEditingEnabled(false);
        }
        if (isTemporarilyMultiselectEnabledRef.current) {
            setMultiselectEnabled(false);
        }
    });
}

function ctrlKey() {
    return isMac ? "Cmd" : "Ctrl";
}