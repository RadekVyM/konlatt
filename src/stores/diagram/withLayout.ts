import { triggerCancellation, triggerLayoutComputation } from "../../services/triggers";
import { ConceptLatticeLayoutCacheItem } from "../../types/diagram/ConceptLatticeLayoutCacheItem";
import { DiagramLayoutState } from "../../types/diagram/DiagramLayoutState";
import { w } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";
import { createConceptLayoutIndexesRelations, createDiagramLayoutStateId, createEmptyDiagramOffsetMementos } from "./utils";
import { withCanUndoRedo } from "./withCanUndoRedo";
import withConceptsToMoveBox from "./withConceptsToMoveBox";
import withDefaultLayoutBox from "./withDefaultLayoutBox";

/**
 * Manages the diagram layout lifecycle.
 * It coordinates between cached layouts, active layout computations (jobs),
 * and state synchronization. If a layout for the new state exists in the cache, 
 * it applies it immediately; otherwise, it triggers a background computation.
 */
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
        // Cancel any pending layout jobs as we've found a valid cached version.
        if (oldState.currentLayoutJobId !== null) {
            triggerCancellation(oldState.currentLayoutJobId);
        }

        return w({
            layout: cachedLayoutItem.layout,
            layoutId: `${cachedLayoutItem.layout?.length}-${Math.random()}`,
            ...createConceptLayoutIndexesRelations(cachedLayoutItem.layout),
            diagramOffsets: cachedLayoutItem.diagramOffsets,
            diagramOffsetMementos: cachedLayoutItem.diagramOffsetMementos,
            currentZoomLevel: 1,
            ...newState,
        }, oldState, withConceptsToMoveBox, withDefaultLayoutBox, withCanUndoRedo);
    }

    triggerLayoutComputation(layoutState);

    return w({
        layout: null,
        layoutId: `null-${Math.random()}`,
        conceptToLayoutIndexesMapping: new Map(),
        diagramOffsets: null,
        diagramOffsetMementos: createEmptyDiagramOffsetMementos(),
        ...newState,
    }, oldState, withConceptsToMoveBox, withDefaultLayoutBox, withCanUndoRedo);
}

/**
 * Retrieves a cached layout item by its unique state signature.
 */
function tryGetLayoutFromCache(
    layoutCache: ReadonlyMap<string, ConceptLatticeLayoutCacheItem>,
    stateId: string,
): ConceptLatticeLayoutCacheItem | null {
    return layoutCache.get(stateId) || null;
}