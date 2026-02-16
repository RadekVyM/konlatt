import { Box } from "../../types/Box";
import { ExplorerConcept } from "../../types/explorer/ExplorerConcept";
import { withFallback } from "../../utils/stores";
import { ExplorerStore } from "./useExplorerStore";

export default function withLayoutBox(newState: Partial<ExplorerStore>, oldState: ExplorerStore): Partial<ExplorerStore> {
    const concepts = withFallback(newState.concepts, oldState.concepts);

    return {
        ...newState,
        layoutBox: calculateLayoutBox(concepts),
    };
}

function calculateLayoutBox(concepts: ReadonlyArray<ExplorerConcept>) : Box | null {
    if (concepts.length === 0) {
        return null;
    }

    let minX = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;
    let minZ = Number.MAX_SAFE_INTEGER;
    let maxZ = Number.MIN_SAFE_INTEGER;

    for (const concept of concepts) {
        minX = Math.min(minX, concept.position[0]);
        maxX = Math.max(maxX, concept.position[0]);
        minY = Math.min(minY, concept.position[1]);
        maxY = Math.max(maxY, concept.position[1]);
        minZ = Math.min(minZ, concept.position[2]);
        maxZ = Math.max(maxZ, concept.position[2]);
    }

    if (minX === Number.MAX_SAFE_INTEGER || maxX === Number.MIN_SAFE_INTEGER ||
        minY === Number.MAX_SAFE_INTEGER || maxY === Number.MIN_SAFE_INTEGER ||
        minZ === Number.MAX_SAFE_INTEGER || maxZ === Number.MIN_SAFE_INTEGER) {
        return null;
    }

    return {
        x: minX,
        y: minY,
        z: minZ,
        width: maxX - minX,
        height: maxY - minY,
        depth: maxZ - minZ,
    };
}