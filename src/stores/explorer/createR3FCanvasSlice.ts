import { Box } from "../../types/Box";
import { ExplorerStore } from "./useExplorerStore";

type R3FCanvasSliceState = {
    hoveredConceptIndex: number | null,
    currentZoomLevel: number,
    layoutBox: Box | null,
}

type R3FCanvasSliceActions = {
    setHoveredConceptIndex: (hoveredConceptIndex: number | null) => void,
    setCurrentZoomLevel: (currentZoomLevel: number) => void,
}

export type R3FCanvasSlice = R3FCanvasSliceState & R3FCanvasSliceActions

export const initialState: R3FCanvasSliceState = {
    hoveredConceptIndex: null,
    currentZoomLevel: 1,
    layoutBox: null,
};

export default function createR3FCanvasSlice(set: (partial: ExplorerStore | Partial<ExplorerStore> | ((state: ExplorerStore) => ExplorerStore | Partial<ExplorerStore>), replace?: false) => void): R3FCanvasSlice {
    return {
        ...initialState,
        setHoveredConceptIndex: (hoveredConceptIndex) => set({ hoveredConceptIndex }),
        setCurrentZoomLevel: (currentZoomLevel) => set({ currentZoomLevel }),
    };
}