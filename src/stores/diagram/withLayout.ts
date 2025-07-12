import { triggerCancellation, triggerLayoutComputation } from "../../services/triggers";
import { ConceptLatticeLayoutCacheItem } from "../../types/ConceptLatticeLayoutCacheItem";
import { DiagramLayoutState } from "../../types/DiagramLayoutState";
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
        return withDefaultLayoutBox(withConceptsToMoveBox(newState, oldState), oldState);
    }

    const cachedLayoutItem = tryGetLayoutFromCache(oldState.layoutCache, stateId);

    if (cachedLayoutItem !== null && cachedLayoutItem.layout === oldState.layout) {
        return withDefaultLayoutBox(withConceptsToMoveBox(newState, oldState), oldState);
    }

    if (cachedLayoutItem) {
        if (oldState.currentLayoutJobId !== null) {
            triggerCancellation(oldState.currentLayoutJobId);
        }

        return withDefaultLayoutBox(withConceptsToMoveBox({
            layout: cachedLayoutItem.layout,
            layoutId: `${cachedLayoutItem.layout?.length}-${Math.random()}`,
            ...createConceptLayoutIndexesMappings(cachedLayoutItem.layout),
            diagramOffsets: cachedLayoutItem.diagramOffsets,
            diagramOffsetMementos: cachedLayoutItem.diagramOffsetMementos,
            currentZoomLevel: 1,
            ...newState,
        }, oldState), oldState);
    }

    triggerLayoutComputation(layoutState);

    return withDefaultLayoutBox(withConceptsToMoveBox({
        layout: null,
        layoutId: `null-${Math.random()}`,
        conceptToLayoutIndexesMapping: new Map(),
        diagramOffsets: null,
        diagramOffsetMementos: createEmptyDiagramOffsetMementos(),
        ...newState,
    }, oldState), oldState);
}

function tryGetLayoutFromCache(
    layoutCache: Map<string, ConceptLatticeLayoutCacheItem>,
    stateId: string,
): ConceptLatticeLayoutCacheItem | null {
    return layoutCache.get(stateId) || null;
}