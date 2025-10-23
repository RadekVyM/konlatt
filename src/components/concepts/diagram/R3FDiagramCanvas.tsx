import { Canvas, useThree } from "@react-three/fiber";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { useEffect } from "react";
import Nodes from "./Nodes";
import { AdaptiveDprOnMovement } from "./AdaptiveDprOnMovement";
import Links from "./Links";
import NodesToMove from "./NodesToMove";
import Labels from "./Labels";
import NodesMultiselectionBox from "./NodesMultiselectionBox";
import { isRightClick } from "../../../utils/html";
import Grid from "./Grid";
import CameraController from "./CameraController";
import Gizmo from "./Gizmo";

export default function DiagramCanvas(props: {
    className?: string,
}) {
    const antialiasEnabled = useDiagramStore((state) => state.antialiasEnabled);
    const canvasEvents = useCanvasEvents();

    return (
        <Canvas
            key={`${antialiasEnabled}`}
            className={props.className}
            frameloop="demand"
            flat
            gl={{
                antialias: antialiasEnabled,
            }}
            dpr={[Math.min(0.25, window.devicePixelRatio), window.devicePixelRatio]}
            performance={{
                min: 0.25,
            }}
            {...canvasEvents}>
            <CameraController />

            <EventsController />

            <AdaptiveDprOnMovement />

            <Content />

            <NodesMultiselectionBox />

            <Gizmo />
        </Canvas>
    );
}

function Content() {
    const layoutId = useDiagramStore((state) => state.layoutId);
    const semitransparentLinksEnabled = useDiagramStore((state) => state.semitransparentLinksEnabled);

    return (
        <>
            <Grid />

            <Links
                key={`${semitransparentLinksEnabled}-links`} />

            <Labels />

            <Nodes
                key={`${layoutId}-nodes`} />

            <NodesToMove
                key={`${layoutId}-nodes-to-move`} />
        </>
    );
}

function EventsController() {
    const setEvents = useThree((state) => state.setEvents);
    const eventsEnabled = useDiagramStore((state) => state.eventsEnabled);

    useEffect(() => setEvents({ enabled: eventsEnabled }), [eventsEnabled]);

    return undefined;
}

function useCanvasEvents() {
    function onPointerMissed(e: MouseEvent) {
        if (isRightClick(e)) {
            return;
        }

        const diagramStore = useDiagramStore.getState();

        if (diagramStore.editingEnabled) {
            // Testing for diagramStore.isDraggingNodes is needed
            // because clicking PivotControls is detected as onPointerMissed
            // To make this working, setting diagramStore.isDraggingNodes to false
            // has to be delayed a bit in the store
            if (!diagramStore.isDraggingNodes) {
                diagramStore.setConceptsToMoveIndexes(new Set());
            }
        }
        else {
            diagramStore.setSelectedConceptIndex(null);
        }
    }

    function onContextMenuCapture(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
    }

    return {
        onContextMenuCapture,
        onPointerMissed,
    };
}