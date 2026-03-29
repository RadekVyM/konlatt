import { ConceptLatticeLayout } from "../../types/diagram/ConceptLatticeLayout";
import { ConceptLatticeLayoutCacheItem } from "../../types/diagram/ConceptLatticeLayoutCacheItem";
import { DiagramLayoutState } from "../../types/diagram/DiagramLayoutState";
import { DiagramOffsetMementos } from "../../types/diagram/DiagramOffsetMementos";
import { createNodeOffsetMemento } from "../../types/diagram/NodeOffsetMemento";
import { createPoint, Point } from "../../types/Point";
import { rotatePoint } from "../../utils/layout";
import { w, withFallback } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";
import { createConceptLayoutIndexesRelations, createDefaultDiagramOffsets, createDiagramLayoutStateId, createEmptyDiagramOffsetMementos } from "./utils";
import { withCanUndoRedo } from "./withCanUndoRedo";
import withConceptsToMoveBox from "./withConceptsToMoveBox";
import withDefaultLayoutBox from "./withDefaultLayoutBox";
import withDiagramLabeling from "./withDiagramLabeling";

const CACHE_MAX_SIZE = 5_000_000;

type DiagramLayoutSliceState = {
    /** The actual lattice layout data */
    layout: ConceptLatticeLayout | null,
    /** This ID is used to trigger rerender of some React components using the `key` property */
    layoutId: string,
    conceptToLayoutIndexesMapping: ReadonlyMap<number, number>,
    layoutToConceptIndexesMapping: ReadonlyMap<number, number>,
    /** LRU-style cache for storing previous layout states */
    layoutCache: ReadonlyMap<string, ConceptLatticeLayoutCacheItem>,
    /** ID of the currently running background layout calculation job */
    currentLayoutJobId: number | null,
    /** The state ID associated with the current layout job */
    currentLayoutJobStateId: string | null,
    /** Local offsets applied to nodes by the user (manual positioning) */
    diagramOffsets: ReadonlyArray<Point> | null,
    /** History of offsets for undo/redo functionality */
    diagramOffsetMementos: DiagramOffsetMementos,
    canUndo: boolean,
    canRedo: boolean,
}

type DiagramLayoutSliceActions = {
    /** Updates the current layout and resets associated mappings and offsets */
    setLayout: (layout: ConceptLatticeLayout | null) => void,
    /** Tracks an active layout computation job */
    setCurrentLayoutJobId: (currentLayoutJobId: number | null, layoutState: DiagramLayoutState | null) => void,
    /** Updates the positional offsets for a set of concepts (e.g., after a drag interaction) */
    updateNodeOffsets: (conceptIndexes: Iterable<number>, offset: Point) => void,
    undo: () => void,
    redo: () => void,
}

export type DiagramLayoutSlice = DiagramLayoutSliceState & DiagramLayoutSliceActions

export const initialState: DiagramLayoutSliceState = {
    layout: null,
    layoutId: "",
    layoutCache: new Map(),
    conceptToLayoutIndexesMapping: new Map(),
    layoutToConceptIndexesMapping: new Map(),
    currentLayoutJobId: null,
    currentLayoutJobStateId: null,
    diagramOffsets: null,
    diagramOffsetMementos: createEmptyDiagramOffsetMementos(),
    canUndo: false,
    canRedo: false,
};

/**
 * Slice for a Zustand store that manages the layout, node offsets, and layout caching 
 * for the concept lattice diagram.
 */
export default function createDiagramLayoutSlice(set: (partial: DiagramStore | Partial<DiagramStore> | ((state: DiagramStore) => DiagramStore | Partial<DiagramStore>), replace?: false) => void): DiagramLayoutSlice {
    return {
        ...initialState,
        setLayout: (layout) => set((old) => {
            const diagramOffsets = layout ? createDefaultDiagramOffsets(layout.length) : null;
            const diagramOffsetMementos = createEmptyDiagramOffsetMementos();

            return w({
                layout,
                // Generate a new ID to trigger component remounting if necessary
                layoutId: `${layout?.length}-${Math.random()}`,
                ...createConceptLayoutIndexesRelations(layout),
                diagramOffsets,
                diagramOffsetMementos,
                layoutCache: layout && diagramOffsets ?
                    updateLayoutCache(
                        old.layoutCache,
                        layout,
                        diagramOffsets,
                        diagramOffsetMementos,
                        old) :
                    new Map(),
                conceptsToMoveIndexes: new Set(),
                currentZoomLevel: 1,
            }, old, withConceptsToMoveBox, withDefaultLayoutBox, withCanUndoRedo, withDiagramLabeling);
        }),
        setCurrentLayoutJobId: (currentLayoutJobId, layoutState) => set(() => ({
            currentLayoutJobId,
            currentLayoutJobStateId: layoutState === null ? null : createDiagramLayoutStateId(layoutState),
        })),
        updateNodeOffsets: (conceptIndexes, offset) => set((old) => {
            const diagramOffsets = old.diagramOffsets;
            const conceptToLayoutIndexesMapping = old.conceptToLayoutIndexesMapping;
            const rotationDegrees = old.rotationDegrees;

            if (!diagramOffsets || !conceptToLayoutIndexesMapping) {
                return {};
            }

            const layoutIndexes = new Array<number>();
            for (const conceptIndex of conceptIndexes) {
                const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex);

                if (layoutIndex === undefined) {
                    console.error(`Layout index should not be ${layoutIndex}`);
                    continue;
                }

                layoutIndexes.push(layoutIndex);   
            }

            offset = rotatePoint(offset, -rotationDegrees);
            const newOffsets = [...diagramOffsets];
            applyOffset(newOffsets, layoutIndexes, offset);

            return withNodeOffsetsUpdated({
                diagramOffsets: newOffsets,
                diagramOffsetMementos: {
                    redos: [], undos: [...old.diagramOffsetMementos.undos, createNodeOffsetMemento(layoutIndexes, offset)],
                },
            }, old);
        }),
        undo: () => set((old) => {
            const diagramOffsets = old.diagramOffsets;
            const undos = old.diagramOffsetMementos.undos;
            const redos = old.diagramOffsetMementos.redos;

            if (undos.length === 0 || !diagramOffsets) {
                return {};
            }

            const memento = undos[undos.length - 1];
            const newOffsets = [...diagramOffsets];

            applyOffset(newOffsets, memento.nodes, memento.offset, -1);

            return withNodeOffsetsUpdated({
                diagramOffsets: newOffsets,
                diagramOffsetMementos: {
                    undos: undos.slice(0, undos.length - 1),
                    redos: [...redos, memento],
                },
            }, old);
        }),
        redo: () => set((old) => {
            const diagramOffsets = old.diagramOffsets;
            const undos = old.diagramOffsetMementos.undos;
            const redos = old.diagramOffsetMementos.redos;

            if (redos.length === 0 || !diagramOffsets) {
                return {};
            }

            const memento = redos[redos.length - 1];
            const newOffsets = [...diagramOffsets];

            applyOffset(newOffsets, memento.nodes, memento.offset);

            return withNodeOffsetsUpdated({
                diagramOffsets: newOffsets,
                diagramOffsetMementos: {
                    redos: redos.slice(0, redos.length - 1),
                    undos: [...undos, memento],
                },
            }, old);
        }),
    };
}

/**
 * Updates node offsets while ensuring the layout cache is kept in sync.
 */
function withNodeOffsetsUpdated(
    newState: Partial<DiagramStore>,
    oldState: DiagramStore,
): Partial<DiagramStore> {
    const diagramOffsets = withFallback(newState.diagramOffsets, oldState.diagramOffsets);
    const diagramOffsetMementos = withFallback(newState.diagramOffsetMementos, oldState.diagramOffsetMementos);
    const stateId = createDiagramLayoutStateId(oldState);
    const cacheItem = oldState.layoutCache.get(stateId);

    if (cacheItem) {
        if (diagramOffsetMementos) {
            cacheItem.diagramOffsetMementos = diagramOffsetMementos;
        }
        if (diagramOffsets) {
            cacheItem.diagramOffsets = diagramOffsets;
        }
    }

    return w(newState, oldState, withConceptsToMoveBox, withCanUndoRedo);
}

/**
 * Updates the layout cache, adding new items and removing oldest entries when CACHE_MAX_SIZE is exceeded.
 */
function updateLayoutCache(
    layoutCache: ReadonlyMap<string, ConceptLatticeLayoutCacheItem>,
    newLayout: ConceptLatticeLayout,
    diagramOffsets: ReadonlyArray<Point>,
    diagramOffsetMementos: DiagramOffsetMementos,
    layoutState: DiagramLayoutState,
): ReadonlyMap<string, ConceptLatticeLayoutCacheItem> {
    const stateId = createDiagramLayoutStateId(layoutState);
    const newCache = new Map<string, ConceptLatticeLayoutCacheItem>(layoutCache);
    newCache.set(stateId, { layout: newLayout, stateId, diagramOffsetMementos, diagramOffsets, createdAt: new Date() });

    const totalPointsCount = [...newCache.values()].reduce((previous, current) => previous + current.layout.length, 0);

    // Shrink the cache if needed
    if (totalPointsCount > CACHE_MAX_SIZE) {
        const entries = new Array<[string, ConceptLatticeLayoutCacheItem]>();
        let addedPointsCount = 0;

        // Make sure that the newest layout is always added
        entries.push([stateId, newCache.get(stateId)!]);
        addedPointsCount += newLayout.length;

        for (const entry of [...newCache.entries()]
            .sort((a, b) => b[1].createdAt.getTime() - a[1].createdAt.getTime()) // Iterating from newest to oldest
            .filter((e) => e[0] !== stateId)) {
            if (addedPointsCount + entry[1].layout.length > CACHE_MAX_SIZE) {
                break;
            }

            entries.push(entry);
            addedPointsCount += entry[1].layout.length;
        }

        return new Map<string, ConceptLatticeLayoutCacheItem>(entries);
    }

    return newCache;
}

function applyOffset(offsets: Array<Point>, nodes: ReadonlyArray<number>, offset: Point, factor: number = 1) {
    for (const node of nodes) {
        const currentValue = offsets[node];
        offsets[node] = createPoint(
            currentValue[0] + (offset[0] * factor),
            currentValue[1] + (offset[1] * factor),
            currentValue[2] + (offset[2] * factor),
        );
    }
}