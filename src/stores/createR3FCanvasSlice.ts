import { Point } from "../types/Point";

type R3FCanvasSliceState = {
    cameraControlsEnabled: boolean,
    eventsEnabled: boolean,
    isCameraMoving: boolean,
    isDraggingNodes: boolean,
    dragOffset: Point,
    conceptsToMoveIndexes: Set<number>,
}

type R3FCanvasSliceActions = {
    setIsDraggingNodes: (isDraggingNodes: boolean) => void,
    setIsCameraMoving: (isCameraMoving: boolean) => void,
    setDragOffset: (dragOffset: Point) => void,
    setConceptsToMoveIndexes: React.Dispatch<React.SetStateAction<Set<number>>>,
}

export type R3FCanvasSlice = R3FCanvasSliceState & R3FCanvasSliceActions

export const initialState: R3FCanvasSliceState = {
    cameraControlsEnabled: true,
    eventsEnabled: true,
    isCameraMoving: false,
    isDraggingNodes: false,
    dragOffset: [0, 0, 0],
    conceptsToMoveIndexes: new Set<number>(),
};

export default function createR3FCanvasSlice(set: (partial: R3FCanvasSlice | Partial<R3FCanvasSlice> | ((state: R3FCanvasSlice) => R3FCanvasSlice | Partial<R3FCanvasSlice>), replace?: false) => void): R3FCanvasSlice {
    return {
        ...initialState,
        setIsDraggingNodes: (isDraggingNodes: boolean) => set((old) => ({
            isDraggingNodes,
            cameraControlsEnabled: !isDraggingNodes,
            eventsEnabled: !old.isCameraMoving && !isDraggingNodes,
        })),
        setIsCameraMoving: (isCameraMoving: boolean) => set((old) => ({
            isCameraMoving,
            eventsEnabled: !isCameraMoving && !old.isDraggingNodes,
        })),
        setDragOffset: (dragOffset: Point) => set(() => ({ dragOffset })),
        setConceptsToMoveIndexes: (conceptsToMoveIndexes) => set((old) => ({
            conceptsToMoveIndexes: typeof conceptsToMoveIndexes === "function" ?
                conceptsToMoveIndexes(old.conceptsToMoveIndexes) :
                conceptsToMoveIndexes
        })),
    };
}