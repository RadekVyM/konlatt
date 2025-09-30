import { MAX_SEED_LENGTH_REDRAW } from "../../constants/diagram";
import { calculateConeConceptIndexes } from "../../services/lattice";
import { CameraType } from "../../types/CameraType";
import { DiagramLayoutState } from "../../types/DiagramLayoutState";
import { LayoutMethod } from "../../types/LayoutMethod";
import { w } from "../../utils/stores";
import { generateRandomSeed } from "../../utils/string";
import useDataStructuresStore from "../useDataStructuresStore";
import { DiagramStore } from "./useDiagramStore";
import withCameraControlsEnabled from "./withCameraControlsEnabled";
import withConceptsToMoveBox from "./withConceptsToMoveBox";
import withDefaultLayoutBox from "./withDefaultLayoutBox";
import withLayout from "./withLayout";

type DiagramOptionsSliceState = {
    layoutMethod: LayoutMethod,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    movementRegressionEnabled: boolean,
    linksVisibleEnabled: boolean,
    hoveredConceptDetailEnabled: boolean,
    hoveredLinksHighlightingEnabled: boolean,
    selectedLinksHighlightingEnabled: boolean,
    semitransparentLinksEnabled: boolean,
    editingEnabled: boolean,
    gridWhileEditingEnabled: boolean,
    multiselectEnabled: boolean,
    antialiasEnabled: boolean,
    labelsEnabled: boolean,
    flatLinksEnabled: boolean,
    visibleConceptIndexes: Set<number> | null,
} & DiagramLayoutState

type DiagramOptionsSliceActions = {
    setLayoutMethod: (layoutMethod: LayoutMethod) => void,
    setCameraType: (cameraType: CameraType) => void,
    setHorizontalScale: (horizontalScale: number) => void,
    setVerticalScale: (verticalScale: number) => void,
    setRotationDegrees: (rotationDegrees: number) => void,
    setMovementRegressionEnabled: (movementRegressionEnabled: boolean) => void,
    setLinksVisibleEnabled: (linksVisibleEnabled: boolean) => void,
    setHoveredConceptDetailEnabled: (hoveredConceptDetailEnabled: boolean) => void,
    setHoveredLinksHighlightingEnabled: (hoveredLinksHighlightingEnabled: boolean) => void,
    setSelectedLinksHighlightingEnabled: (selectedLinksHighlightingEnabled: boolean) => void,
    setSemitransparentLinksEnabled: (semitransparentLinksEnabled: boolean) => void,
    setAntialiasEnabled: (antialiasEnabled: boolean) => void,
    setLabelsEnabled: (labelsEnabled: boolean) => void,
    setFlatLinksEnabled: (flatLinksEnabled: boolean) => void,
    setEditingEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setGridWhileEditingEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setMultiselectEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setDisplayHighlightedSublatticeOnly: React.Dispatch<React.SetStateAction<boolean>>,
    setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex: number | null, withOtherReset?: boolean) => void,
    setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex: number | null, withOtherReset?: boolean) => void,
    setParallelizeReDraw: React.Dispatch<React.SetStateAction<boolean>>,
    setTargetDimensionReDraw: React.Dispatch<React.SetStateAction<2 | 3>>,
    setSeedReDraw: (seedReDraw: string) => void,
}

export type DiagramOptionsSlice = DiagramOptionsSliceState & DiagramOptionsSliceActions

export function initialState(): DiagramOptionsSliceState {
    return {
        cameraType: "2d",
        layoutMethod: "layered",
        horizontalScale: 1,
        verticalScale: 1,
        rotationDegrees: 0,
        movementRegressionEnabled: false,
        linksVisibleEnabled: true,
        hoveredConceptDetailEnabled: true,
        hoveredLinksHighlightingEnabled: false,
        selectedLinksHighlightingEnabled: false,
        semitransparentLinksEnabled: true,
        antialiasEnabled: true,
        labelsEnabled: true,
        flatLinksEnabled: false,
        editingEnabled: false,
        gridWhileEditingEnabled: true,
        multiselectEnabled: false,
        displayHighlightedSublatticeOnly: false,
        upperConeOnlyConceptIndex: null,
        lowerConeOnlyConceptIndex: null,
        visibleConceptIndexes: null,
        parallelizeReDraw: true,
        targetDimensionReDraw: 2,
        seedReDraw: generateRandomSeed(MAX_SEED_LENGTH_REDRAW),
    };
}

export default function createDiagramOptionsSlice(set: (partial: DiagramStore | Partial<DiagramStore> | ((state: DiagramStore) => DiagramStore | Partial<DiagramStore>), replace?: false) => void): DiagramOptionsSlice {
    return {
        ...initialState(),
        setLayoutMethod: (layoutMethod) => set((old) => withLayout({ layoutMethod }, old)),
        setCameraType: (cameraType) => set((old) => w({ cameraType, currentZoomLevel: 1 }, old, withConceptsToMoveBox, withDefaultLayoutBox)),
        setMovementRegressionEnabled: (movementRegressionEnabled) => set({ movementRegressionEnabled }),
        setLinksVisibleEnabled: (linksVisibleEnabled) => set({ linksVisibleEnabled }),
        setHoveredConceptDetailEnabled: (hoveredConceptDetailEnabled) => set({ hoveredConceptDetailEnabled }),
        setHoveredLinksHighlightingEnabled: (hoveredLinksHighlightingEnabled) => set({ hoveredLinksHighlightingEnabled }),
        setSelectedLinksHighlightingEnabled: (selectedLinksHighlightingEnabled) => set({ selectedLinksHighlightingEnabled }),
        setSemitransparentLinksEnabled: (semitransparentLinksEnabled) => set({ semitransparentLinksEnabled }),
        setAntialiasEnabled: (antialiasEnabled) => set({ antialiasEnabled }),
        setLabelsEnabled: (labelsEnabled) => set({ labelsEnabled }),
        setFlatLinksEnabled: (flatLinksEnabled) => set({ flatLinksEnabled }),
        setEditingEnabled: (editingEnabled) => set((old) => {
            const newValue = typeof editingEnabled === "function" ?
                editingEnabled(old.editingEnabled) :
                editingEnabled;

            return withCameraControlsEnabled(newValue === old.editingEnabled ?
                {} :
                withConceptsToMoveBox({
                    editingEnabled: newValue,
                    multiselectEnabled: false,
                    conceptsToMoveIndexes: new Set()
                }, old), old);
        }),
        setGridWhileEditingEnabled: (gridWhileEditingEnabled) => set((old) => ({
            gridWhileEditingEnabled: (typeof gridWhileEditingEnabled === "function" ?
                gridWhileEditingEnabled(old.gridWhileEditingEnabled) :
                gridWhileEditingEnabled)
        })),
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
                visibleConceptIndexes: calculateConeConceptIndexes(
                    upperConeOnlyConceptIndex,
                    withOtherReset ? null : old.lowerConeOnlyConceptIndex,
                    useDataStructuresStore.getState().lattice),
            },
            old)),
        setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex, withOtherReset) => set((old) => withLayout(
            {
                lowerConeOnlyConceptIndex,
                upperConeOnlyConceptIndex: withOtherReset ? null : old.upperConeOnlyConceptIndex,
                visibleConceptIndexes: calculateConeConceptIndexes(
                    withOtherReset ? null : old.upperConeOnlyConceptIndex,
                    lowerConeOnlyConceptIndex,
                    useDataStructuresStore.getState().lattice),
            },
            old)),
        setParallelizeReDraw: (parallelizeReDraw) => set((old) => withLayout(
            {
                parallelizeReDraw: typeof parallelizeReDraw === "function" ?
                    parallelizeReDraw(old.parallelizeReDraw) :
                    parallelizeReDraw
            },
            old)),
        setTargetDimensionReDraw: (targetDimensionReDraw) => set((old) => withLayout(
            {
                targetDimensionReDraw: typeof targetDimensionReDraw === "function" ?
                    targetDimensionReDraw(old.targetDimensionReDraw) :
                    targetDimensionReDraw
            },
            old)),
        setSeedReDraw: (seedReDraw) => set((old) => withLayout({ seedReDraw }, old)),
        setHorizontalScale: (horizontalScale) => set((old) => w({ horizontalScale }, old, withConceptsToMoveBox, withDefaultLayoutBox)),
        setVerticalScale: (verticalScale) => set((old) => w({ verticalScale }, old, withConceptsToMoveBox, withDefaultLayoutBox)),
        setRotationDegrees: (rotationDegrees) => set((old) => w({ rotationDegrees }, old, withConceptsToMoveBox, withDefaultLayoutBox)),
    };
}