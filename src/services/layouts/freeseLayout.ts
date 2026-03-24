import Module from "../../cpp";
import { cppFloatArrayToFloat32Array } from "../../utils/cpp";

/**
 * Executes the Freese layout algorithm via WebAssembly to compute 
 * coordinates for a concept lattice.
 * @param conceptsCount - The total number of concepts in the lattice.
 * @param supremum - The index of the supremum of the lattice.
 * @param infimum - The index of the infimum of the lattice.
 * @param subconceptsRelationArrayBuffer - A flattened adjacency relation buffer 
 * representing the subconcept hierarchy.
 * @param onProgress - Callback function to track the computation's progress (0.0 to 1.0).
 * @returns A promise resolving to the computed layout coordinates and the execution 
 * time in milliseconds.
 */
export async function computeFreeseLayout(
    conceptsCount: number,
    supremum: number,
    infimum: number,
    subconceptsRelationArrayBuffer: Int32Array,
    onProgress: (progress: number) => void,
): Promise<{
    layout: Float32Array,
    computationTime: number,
}> {
    const module = await Module();
    const result = new module.FloatArrayTimedResult();

    module.computeFreeseLayout(result, supremum, infimum, conceptsCount, subconceptsRelationArrayBuffer, onProgress);
    const layout = cppFloatArrayToFloat32Array(result.value, module, true);
    const computationTime = result.time;

    result.delete();

    return {
        layout,
        computationTime,
    };
}