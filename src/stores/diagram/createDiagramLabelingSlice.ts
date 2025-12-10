import { ConceptLatticeLabeling } from "../../types/ConceptLatticeLabeling";
import { DiagramStore } from "./useDiagramStore";

type DiagramLabelingSliceState = {
    attributesLabeling: ConceptLatticeLabeling | null,
    objectsLabeling: ConceptLatticeLabeling | null,
}

type DiagramLabelingSliceActions = {
}

export type DiagramLabelingSlice = DiagramLabelingSliceState & DiagramLabelingSliceActions

export const initialState: DiagramLabelingSliceState = {
    attributesLabeling: null,
    objectsLabeling: null,
};

export default function createDiagramLabelingSlice(_set: (partial: DiagramStore | Partial<DiagramStore> | ((state: DiagramStore) => DiagramStore | Partial<DiagramStore>), replace?: false) => void): DiagramLabelingSlice {
    return {
        ...initialState,
    }
}