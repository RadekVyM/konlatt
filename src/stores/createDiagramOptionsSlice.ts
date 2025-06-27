import { CameraType } from "../types/CameraType";
import { DiagramStore } from "./useDiagramStore";

type DiagramOptionsSliceState = {
    cameraType: CameraType,
    movementRegressionEnabled: boolean,
    linksVisibleEnabled: boolean,
    semitransparentLinksEnabled: boolean,
    editingEnabled: boolean,
    antialiasEnabled: boolean,
    labelsEnabled: boolean,
}

type DiagramOptionsSliceActions = {
    setCameraType: (cameraType: CameraType) => void,
    setMovementRegressionEnabled: (movementRegressionEnabled: boolean) => void,
    setLinksVisibleEnabled: (linksVisibleEnabled: boolean) => void,
    setSemitransparentLinksEnabled: (semitransparentLinksEnabled: boolean) => void,
    setAntialiasEnabled: (antialiasEnabled: boolean) => void,
    setLabelsEnabled: (labelsEnabled: boolean) => void,
    setEditingEnabled: React.Dispatch<React.SetStateAction<boolean>>,
}

export type DiagramOptionsSlice = DiagramOptionsSliceState & DiagramOptionsSliceActions

export const initialState: DiagramOptionsSliceState = {
    cameraType: "2d",
    movementRegressionEnabled: false,
    linksVisibleEnabled: true,
    semitransparentLinksEnabled: true,
    antialiasEnabled: true,
    labelsEnabled: true,
    editingEnabled: false,
};

export default function createDiagramOptionsSlice(set: (partial: DiagramStore | Partial<DiagramStore> | ((state: DiagramStore) => DiagramStore | Partial<DiagramStore>), replace?: false) => void): DiagramOptionsSlice {
    return {
        ...initialState,
        setCameraType: (cameraType: CameraType) => set({ cameraType, currentZoomLevel: 1 }),
        setMovementRegressionEnabled: (movementRegressionEnabled: boolean) => set({ movementRegressionEnabled }),
        setLinksVisibleEnabled: (linksVisibleEnabled: boolean) => set({ linksVisibleEnabled }),
        setSemitransparentLinksEnabled: (semitransparentLinksEnabled: boolean) => set({ semitransparentLinksEnabled }),
        setAntialiasEnabled: (antialiasEnabled: boolean) => set({ antialiasEnabled }),
        setLabelsEnabled: (labelsEnabled: boolean) => set({ labelsEnabled }),
        setEditingEnabled: (editingEnabled) => set((old) => ({
            editingEnabled: typeof editingEnabled === "function" ?
                editingEnabled(old.editingEnabled) :
                editingEnabled,
            conceptsToMoveIndexes: new Set(),
        })),
    };
}