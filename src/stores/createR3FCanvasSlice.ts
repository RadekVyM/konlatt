import { Point } from "../types/Point";

type R3FCanvasSliceState = {
    cameraControlsEnabled: boolean,
    eventsEnabled: boolean,
    isCameraMoving: boolean,
    isDraggingNodes: boolean,
    dragOffset: Point,
    conceptsToMoveIndexes: Set<number>,
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
    hoveredConceptIndex: null,
    currentZoomLevel: 1,
};

let isDraggingNodesTimeout: number | null = null;

export default function createR3FCanvasSlice(set: (partial: R3FCanvasSlice | Partial<R3FCanvasSlice> | ((state: R3FCanvasSlice) => R3FCanvasSlice | Partial<R3FCanvasSlice>), replace?: false) => void): R3FCanvasSlice {
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
                isDraggingNodesTimeout = setTimeout(() => set((old) => createNewIsDraggingNodesState(isDraggingNodes, old)), 10);
            }
            else {
                set((old) => createNewIsDraggingNodesState(isDraggingNodes, old));
            }
        },
        setIsCameraMoving: (isCameraMoving) => set((old) => ({
            isCameraMoving,
            eventsEnabled: !isCameraMoving && !old.isDraggingNodes,
        })),
        setDragOffset: (dragOffset) => set(() => ({ dragOffset })),
        setConceptsToMoveIndexes: (conceptsToMoveIndexes) => set((old) => ({
            conceptsToMoveIndexes: typeof conceptsToMoveIndexes === "function" ?
                conceptsToMoveIndexes(old.conceptsToMoveIndexes) :
                conceptsToMoveIndexes
        })),
        setHoveredConceptIndex: (hoveredConceptIndex) => set({ hoveredConceptIndex }),
        setCurrentZoomLevel: (currentZoomLevel) => set({ currentZoomLevel }),
    };
}

function createNewIsDraggingNodesState(isDraggingNodes: boolean, old: R3FCanvasSlice): Partial<R3FCanvasSlice> {
    return {
        isDraggingNodes,
        cameraControlsEnabled: !isDraggingNodes,
        eventsEnabled: !old.isCameraMoving && !isDraggingNodes,
    };
}