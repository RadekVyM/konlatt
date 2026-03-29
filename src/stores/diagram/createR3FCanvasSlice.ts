import { Box } from "../../types/Box";
import { Point } from "../../types/Point";
import { DiagramStore } from "./useDiagramStore";
import withCameraControlsEnabled from "./withCameraControlsEnabled";
import withConceptsToMoveBox from "./withConceptsToMoveBox";
import withDragOffsetSnapping from "./withDragOffsetSnapping";

type R3FCanvasSliceState = {
    defaultLayoutBox: Box | null,
    cameraControlsEnabled: boolean,
    eventsEnabled: boolean,
    isCameraMoving: boolean,
    isDraggingNodes: boolean,
    isDraggingNodesSnappedToXAxis: boolean,
    isDraggingNodesSnappedToYAxis: boolean,
    isDraggingNodesSnappedToZAxis: boolean,
    isDraggingNodesInXYPlane: boolean | null,
    isDraggingNodesInXZPlane: boolean | null,
    isDraggingNodesInYZPlane: boolean | null,
    dragOffset: Point,
    conceptsToMoveIndexes: ReadonlySet<number>,
    conceptsToMoveBox: Box | null,
    snapCoords: Point | null,
    hoveredConceptIndex: number | null,
    currentZoomLevel: number,
}

type R3FCanvasSliceActions = {
    /**
     * Updates the dragging state. When dragging stops, a small delay is introduced 
     * to prevent race conditions with canvas pointer events.
     */
    setIsDraggingNodes: (isDraggingNodes: boolean) => void,
    /** Updates the camera motion state and toggles event handling accordingly. */
    setIsCameraMoving: (isCameraMoving: boolean) => void,
    setDragOffset: (dragOffset: Point) => void,
    /** Updates the set of indexes for concepts being moved and recalculates their bounding box. */
    setConceptsToMoveIndexes: React.Dispatch<React.SetStateAction<ReadonlySet<number>>>,
    setHoveredConceptIndex: (hoveredConceptIndex: number | null) => void,
    setCurrentZoomLevel: (currentZoomLevel: number) => void,
}

export type R3FCanvasSlice = R3FCanvasSliceState & R3FCanvasSliceActions

export const initialState: R3FCanvasSliceState = {
    defaultLayoutBox: null,
    cameraControlsEnabled: true,
    eventsEnabled: true,
    isCameraMoving: false,
    isDraggingNodes: false,
    isDraggingNodesSnappedToXAxis: false,
    isDraggingNodesSnappedToYAxis: false,
    isDraggingNodesSnappedToZAxis: false,
    isDraggingNodesInXYPlane: null,
    isDraggingNodesInXZPlane: null,
    isDraggingNodesInYZPlane: null,
    dragOffset: [0, 0, 0],
    conceptsToMoveIndexes: new Set<number>(),
    conceptsToMoveBox: null,
    snapCoords: null,
    hoveredConceptIndex: null,
    currentZoomLevel: 1,
};

// Tracks the timeout ID for delaying the reset of the dragging state
let isDraggingNodesTimeout: number | null = null;

/**
 * Slice for a Zustand store that manages the React Three Fiber (R3F) canvas state,
 * including camera controls, node dragging interactions, and snapping logic.
 */
export default function createR3FCanvasSlice(set: (partial: DiagramStore | Partial<DiagramStore> | ((state: DiagramStore) => DiagramStore | Partial<DiagramStore>), replace?: false) => void): R3FCanvasSlice {
    return {
        ...initialState,
        setIsDraggingNodes: (isDraggingNodes) => {
            if (isDraggingNodesTimeout !== null) {
                clearTimeout(isDraggingNodesTimeout);
            }

            if (!isDraggingNodes) {
                // Setting diagramStore.isDraggingNodes to false has to be delayed a bit here.
                // This is needed because diagramStore.isDraggingNodes value is used 
                // to determine if PivotControls were clicked in the onPointerMissed handler of DiagramCanvas
                isDraggingNodesTimeout = setTimeout(() => set((old) => createIsDraggingNodesState(isDraggingNodes, old)), 10);
            }
            else {
                set((old) => createIsDraggingNodesState(isDraggingNodes, old));
            }
        },
        setIsCameraMoving: (isCameraMoving) => set((old) => ({
            isCameraMoving,
            eventsEnabled: !isCameraMoving && !old.isDraggingNodes,
        })),
        setDragOffset: (dragOffset) => set((old) => withDragOffsetSnapping({ dragOffset }, old)),
        setConceptsToMoveIndexes: (conceptsToMoveIndexes) => set((old) => withConceptsToMoveBox({
            conceptsToMoveIndexes: typeof conceptsToMoveIndexes === "function" ?
                conceptsToMoveIndexes(old.conceptsToMoveIndexes) :
                conceptsToMoveIndexes
        }, old)),
        setHoveredConceptIndex: (hoveredConceptIndex) => set({ hoveredConceptIndex }),
        setCurrentZoomLevel: (currentZoomLevel) => set({ currentZoomLevel }),
    };
}

/**
 * Helper to generate the new state when dragging starts or stops,
 * ensuring camera controls are enabled/disabled correctly.
 */
function createIsDraggingNodesState(isDraggingNodes: boolean, old: DiagramStore): Partial<R3FCanvasSlice> {
    return withCameraControlsEnabled({
        isDraggingNodes,
        eventsEnabled: !old.isCameraMoving && !isDraggingNodes,
    }, old);
}