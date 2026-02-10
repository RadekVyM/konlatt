import { ConceptLatticeLabeling } from "../../types/ConceptLatticeLabeling";
import { FormalContext } from "../../types/FormalContext";
import { createRange } from "../../utils/array";
import { DiagramStore } from "./useDiagramStore";
import withFilteredDiagramLabeling from "./withFilteredDiagramLabeling";

type DiagramLabelingSliceState = {
    attributesLabeling: ConceptLatticeLabeling | null,
    filteredAttributesLabeling: ConceptLatticeLabeling | null,
    objectsLabeling: ConceptLatticeLabeling | null,
    filteredObjectsLabeling: ConceptLatticeLabeling | null,
    selectedObjectLabels: ReadonlySet<number>,
    selectedAttributeLabels: ReadonlySet<number>,
}

type DiagramLabelingSliceActions = {
    setupSelectedLabels: (context: FormalContext) => void,
    setSelectedLabels: (
        selectedObjectLabels: ReadonlySet<number>,
        selectedAttributeLabels: ReadonlySet<number>) => void,
}

export type DiagramLabelingSlice = DiagramLabelingSliceState & DiagramLabelingSliceActions

export const initialState: DiagramLabelingSliceState = {
    attributesLabeling: null,
    filteredAttributesLabeling: null,
    objectsLabeling: null,
    filteredObjectsLabeling: null,
    selectedObjectLabels: new Set(),
    selectedAttributeLabels: new Set(),
};

export default function createDiagramLabelingSlice(set: (partial: DiagramStore | Partial<DiagramStore> | ((state: DiagramStore) => DiagramStore | Partial<DiagramStore>), replace?: false) => void): DiagramLabelingSlice {
    return {
        ...initialState,
        setupSelectedLabels: (context) => set((old) => withFilteredDiagramLabeling({
            selectedObjectLabels: new Set(createRange(context.objects.length)),
            selectedAttributeLabels: new Set(createRange(context.attributes.length)),
        }, old)),
        setSelectedLabels: (selectedObjectLabels, selectedAttributeLabels) =>
            set((old) => withFilteredDiagramLabeling({ selectedObjectLabels, selectedAttributeLabels }, old)),
    };
}