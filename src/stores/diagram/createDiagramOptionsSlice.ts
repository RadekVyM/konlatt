import { CameraType } from "../../types/CameraType";
import { DiagramLayoutState } from "../../types/DiagramLayoutState";
import { calculateVisibleConceptIndexes } from "../../utils/lattice";
import useDataStructuresStore from "../useDataStructuresStore";
import { DiagramStore } from "./useDiagramStore";
import withCameraControlsEnabled from "./withCameraControlsEnabled";
import withConceptsToMoveBox from "./withConceptsToMoveBox";
import withDefaultLayoutBox from "./withDefaultLayoutBox";
import withLayout from "./withLayout";

type DiagramOptionsSliceState = {
    cameraType: CameraType,
    movementRegressionEnabled: boolean,
    linksVisibleEnabled: boolean,
    hoveredLinksHighlightingEnabled: boolean,
    semitransparentLinksEnabled: boolean,
    editingEnabled: boolean,
    multiselectEnabled: boolean,
    antialiasEnabled: boolean,
    labelsEnabled: boolean,
    flatLinksEnabled: boolean,
    visibleConceptIndexes: Set<number> | null,
} & DiagramLayoutState

type DiagramOptionsSliceActions = {
    setCameraType: (cameraType: CameraType) => void,
    setMovementRegressionEnabled: (movementRegressionEnabled: boolean) => void,
    setLinksVisibleEnabled: (linksVisibleEnabled: boolean) => void,
    setHoveredLinksHighlightingEnabled: (hoveredLinksHighlightingEnabled: boolean) => void,
    setSemitransparentLinksEnabled: (semitransparentLinksEnabled: boolean) => void,
    setAntialiasEnabled: (antialiasEnabled: boolean) => void,
    setLabelsEnabled: (labelsEnabled: boolean) => void,
    setFlatLinksEnabled: (flatLinksEnabled: boolean) => void,
    setEditingEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setMultiselectEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setDisplayHighlightedSublatticeOnly: React.Dispatch<React.SetStateAction<boolean>>,
    setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex: number | null, withOtherReset?: boolean) => void,
    setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex: number | null, withOtherReset?: boolean) => void,
}

export type DiagramOptionsSlice = DiagramOptionsSliceState & DiagramOptionsSliceActions

export const initialState: DiagramOptionsSliceState = {
    cameraType: "2d",
    movementRegressionEnabled: false,
    linksVisibleEnabled: true,
    hoveredLinksHighlightingEnabled: false,
    semitransparentLinksEnabled: true,
    antialiasEnabled: true,
    labelsEnabled: true,
    flatLinksEnabled: false,
    editingEnabled: false,
    multiselectEnabled: false,
    displayHighlightedSublatticeOnly: false,
    upperConeOnlyConceptIndex: null,
    lowerConeOnlyConceptIndex: null,
    visibleConceptIndexes: null,
};

export default function createDiagramOptionsSlice(set: (partial: DiagramStore | Partial<DiagramStore> | ((state: DiagramStore) => DiagramStore | Partial<DiagramStore>), replace?: false) => void): DiagramOptionsSlice {
    return {
        ...initialState,
        setCameraType: (cameraType: CameraType) => set((old) => withDefaultLayoutBox(withConceptsToMoveBox({ cameraType, currentZoomLevel: 1 }, old), old)),
        setMovementRegressionEnabled: (movementRegressionEnabled: boolean) => set({ movementRegressionEnabled }),
        setLinksVisibleEnabled: (linksVisibleEnabled: boolean) => set({ linksVisibleEnabled }),
        setHoveredLinksHighlightingEnabled: (hoveredLinksHighlightingEnabled: boolean) => set({ hoveredLinksHighlightingEnabled }),
        setSemitransparentLinksEnabled: (semitransparentLinksEnabled: boolean) => set({ semitransparentLinksEnabled }),
        setAntialiasEnabled: (antialiasEnabled: boolean) => set({ antialiasEnabled }),
        setLabelsEnabled: (labelsEnabled: boolean) => set({ labelsEnabled }),
        setFlatLinksEnabled: (flatLinksEnabled: boolean) => set({ flatLinksEnabled }),
        setEditingEnabled: (editingEnabled) => set((old) => {
            const newValue = typeof editingEnabled === "function" ?
                editingEnabled(old.editingEnabled) :
                editingEnabled;

            return newValue === old.editingEnabled ?
                {} :
                withConceptsToMoveBox({
                    editingEnabled: newValue,
                    multiselectEnabled: false,
                    conceptsToMoveIndexes: new Set()
                }, old);
        }),
        setMultiselectEnabled: (multiselectEnabled) => set((old) => withCameraControlsEnabled({
            multiselectEnabled: (typeof multiselectEnabled === "function" ?
                multiselectEnabled(old.multiselectEnabled) :
                multiselectEnabled) && old.editingEnabled
        }, old)),
        setDisplayHighlightedSublatticeOnly: (displayHighlightedSublatticeOnly) => set((old) => withLayout(
            {
                displayHighlightedSublatticeOnly: typeof displayHighlightedSublatticeOnly === "function" ?
                    displayHighlightedSublatticeOnly(old.displayHighlightedSublatticeOnly) :
                    displayHighlightedSublatticeOnly
            },
            old)),
        setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex, withOtherReset) => set((old) => withLayout(
            {
                upperConeOnlyConceptIndex,
                lowerConeOnlyConceptIndex: withOtherReset ? null : old.lowerConeOnlyConceptIndex,
                visibleConceptIndexes: calculateVisibleConceptIndexes(
                    upperConeOnlyConceptIndex,
                    withOtherReset ? null : old.lowerConeOnlyConceptIndex,
                    useDataStructuresStore.getState().lattice),
            },
            old)),
        setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex, withOtherReset) => set((old) => withLayout(
            {
                lowerConeOnlyConceptIndex,
                upperConeOnlyConceptIndex: withOtherReset ? null : old.upperConeOnlyConceptIndex,
                visibleConceptIndexes: calculateVisibleConceptIndexes(
                    withOtherReset ? null : old.upperConeOnlyConceptIndex,
                    lowerConeOnlyConceptIndex,
                    useDataStructuresStore.getState().lattice),
            },
            old)),
    };
}