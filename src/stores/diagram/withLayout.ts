import { triggerCancellation, triggerLayoutComputation } from "../../services/triggers";
import { ConceptLatticeLayoutCacheItem } from "../../types/ConceptLatticeLayoutCacheItem";
import { DiagramLayoutState } from "../../types/DiagramLayoutState";
import { w } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";
import { createConceptLayoutIndexesMappings, createDiagramLayoutStateId, createEmptyDiagramOffsetMementos } from "./utils";
import withConceptsToMoveBox from "./withConceptsToMoveBox";
import withDefaultLayoutBox from "./withDefaultLayoutBox";

export default function withLayout(
    newState: Partial<DiagramStore>,
    oldState: DiagramStore,
): Partial<DiagramStore> {
    const layoutState: DiagramLayoutState = { ...oldState, ...newState };
    const stateId = createDiagramLayoutStateId(layoutState);

    if (oldState.currentLayoutJobStateId === stateId) {
        // Do not react to upperConeOnlyConceptIndex and lowerConeOnlyConceptIndex changes
        // when nothing is rendered yet
        return w(newState, oldState, withConceptsToMoveBox, withDefaultLayoutBox);
    }

    const cachedLayoutItem = tryGetLayoutFromCache(oldState.layoutCache, stateId);

    if (cachedLayoutItem !== null && cachedLayoutItem.layout === oldState.layout) {
        return w(newState, oldState, withConceptsToMoveBox, withDefaultLayoutBox);
    }

    if (cachedLayoutItem) {
        if (oldState.currentLayoutJobId !== null) {
            triggerCancellation(oldState.currentLayoutJobId);
        }

        return w({
            layout: cachedLayoutItem.layout,
            layoutId: `${cachedLayoutItem.layout?.length}-${Math.random()}`,
            ...createConceptLayoutIndexesMappings(cachedLayoutItem.layout),
            diagramOffsets: cachedLayoutItem.diagramOffsets,
            diagramOffsetMementos: cachedLayoutItem.diagramOffsetMementos,
            currentZoomLevel: 1,
            ...newState,
        }, oldState, withConceptsToMoveBox, withDefaultLayoutBox);
    }

    triggerLayoutComputation(layoutState);

    return w({
        layout: null,
        layoutId: `null-${Math.random()}`,
        conceptToLayoutIndexesMapping: new Map(),
        diagramOffsets: null,
        diagramOffsetMementos: createEmptyDiagramOffsetMementos(),
        ...newState,
    }, oldState, withConceptsToMoveBox, withDefaultLayoutBox);
}

function tryGetLayoutFromCache(
    layoutCache: Map<string, ConceptLatticeLayoutCacheItem>,
    stateId: string,
): ConceptLatticeLayoutCacheItem | null {
    return layoutCache.get(stateId) || null;
}