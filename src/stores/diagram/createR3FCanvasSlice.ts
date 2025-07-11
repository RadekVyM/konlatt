import { Box } from "../../types/Box";
import { Point } from "../../types/Point";
import { DiagramStore } from "./useDiagramStore";
import withCameraControlsEnabled from "./withCameraControlsEnabled";
import withConceptsToMoveBox from "./withConceptsToMoveBox";
import withSnapCoords from "./withSnapCoords";

type R3FCanvasSliceState = {
    cameraControlsEnabled: boolean,
    eventsEnabled: boolean,
    isCameraMoving: boolean,
    isDraggingNodes: boolean,
    dragOffset: Point,
    conceptsToMoveIndexes: Set<number>,
    conceptsToMoveBox: Box | null,
    snapCoords: [number | null, number | null, number | null],
    hoveredConceptIndex: number | null,
    currentZoomLevel: number,
}

type R3FCanvasSliceActions = {
    setIsDraggingNodes: (isDraggingNodes: boolean) => void,
    setIsCameraMoving: (isCameraMoving: boolean) => void,
    setDragOffset: (dragOffset: Point) => void,
    setConceptsToMoveIndexes: React.Dispatch<React.SetStateAction<Set<number>>>,
    setHoveredConceptIndex: (hoveredConceptIndex: number | null) => void,
    setCurrentZoomLevel: (currentZoomLevel: number) => void,
}

export type R3FCanvasSlice = R3FCanvasSliceState & R3FCanvasSliceActions

export const initialState: R3FCanvasSliceState = {
    cameraControlsEnabled: true,
    eventsEnabled: true,
    isCameraMoving: false,
    isDraggingNodes: false,
    dragOffset: [0, 0, 0],
    conceptsToMoveIndexes: new Set<number>(),
    conceptsToMoveBox: null,
    snapCoords: [null, null, null],
    hoveredConceptIndex: null,
    currentZoomLevel: 1,
};

let isDraggingNodesTimeout: number | null = null;

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
        setDragOffset: (dragOffset) => set((old) => withSnapCoords({ dragOffset }, old)),
        setConceptsToMoveIndexes: (conceptsToMoveIndexes) => set((old) => withConceptsToMoveBox({
            conceptsToMoveIndexes: typeof conceptsToMoveIndexes === "function" ?
                conceptsToMoveIndexes(old.conceptsToMoveIndexes) :
                conceptsToMoveIndexes
        }, old)),
        setHoveredConceptIndex: (hoveredConceptIndex) => set({ hoveredConceptIndex }),
        setCurrentZoomLevel: (currentZoomLevel) => set({ currentZoomLevel }),
    };
}

function createIsDraggingNodesState(isDraggingNodes: boolean, old: DiagramStore): Partial<R3FCanvasSlice> {
    return withCameraControlsEnabled({
        isDraggingNodes,
        eventsEnabled: !old.isCameraMoving && !isDraggingNodes,
    }, old);
}