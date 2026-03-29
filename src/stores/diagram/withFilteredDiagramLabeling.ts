import { ConceptLatticeLabeling } from "../../types/ConceptLatticeLabeling";
import { withFallback } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";

/**
 * Computes filtered labeling states based on user selection.
 * It synchronizes `filteredAttributesLabeling` and `filteredObjectsLabeling` whenever 
 * the raw labeling data or the set of selected IDs changes.
 */
export default function withFilteredDiagramLabeling(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const attributesLabeling = withFallback(newState.attributesLabeling, oldState.attributesLabeling);
    const objectsLabeling = withFallback(newState.objectsLabeling, oldState.objectsLabeling);
    const selectedAttributeLabels = withFallback(newState.selectedAttributeLabels, oldState.selectedAttributeLabels);
    const selectedObjectLabels = withFallback(newState.selectedObjectLabels, oldState.selectedObjectLabels);

    if (attributesLabeling === null || objectsLabeling === null) {
        return {
            ...newState,
        };
    }

    return {
        ...newState,
        filteredAttributesLabeling: filtered(attributesLabeling, selectedAttributeLabels),
        filteredObjectsLabeling: filtered(objectsLabeling, selectedObjectLabels),
    };
}

/**
 * Intersects a labeling map with a set of active IDs.
 * Only keys that contain at least one selected label are preserved.
 */
function filtered(labeling: ConceptLatticeLabeling, selectedLabels: ReadonlySet<number>): ConceptLatticeLabeling {
    const map = new Map<number, ReadonlyArray<number>>();

    for (const key of labeling.keys()) {
        const labels = labeling.get(key)!;
        const selected = labels.filter((l) => selectedLabels.has(l));

        if (selected.length > 0) {
            map.set(key, selected);
        }
    }

    return map;
}