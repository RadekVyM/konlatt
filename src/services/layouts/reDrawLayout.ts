import Module from "../../cpp";
import { cppFloatArrayToFloat32Array } from "../../utils/cpp";

/**
 * Executes the ReDraw layout algorithm via WebAssembly to compute 
 * coordinates for a concept lattice.
 * @param conceptsCount - The total number of concepts in the lattice.
 * @param supremum - The index of the supremum of the lattice.
 * @param infimum - The index of the infimum of the lattice.
 * @param subconceptsRelationArrayBuffer - A flattened adjacency relation buffer 
 * representing the subconcept hierarchy.
 * @param seed - Seed that is used for the initial random position generation.
 * @param targetDimension - Target dimension of the diagram (2D or 3D).
 * @param parallelize - Whether the line step should be used or not.
 * @param onProgress - Callback function to track the computation's progress (0.0 to 1.0).
 * @returns A promise resolving to the computed layout coordinates and the execution 
 * time in milliseconds.
 */
export async function computeReDrawLayout(
    conceptsCount: number,
    supremum: number,
    infimum: number,
    subconceptsRelationArrayBuffer: Int32Array,
    seed: number,
    targetDimension: 2 | 3,
    parallelize: boolean,
    onProgress: (progress: number) => void,
): Promise<{
    layout: Float32Array,
    computationTime: number,
}> {
    const module = await Module();
    const result = new module.FloatArrayTimedResult();

    module.computeReDrawLayout(result, supremum, infimum, conceptsCount, subconceptsRelationArrayBuffer, seed, targetDimension, parallelize, onProgress);
    const layout = cppFloatArrayToFloat32Array(result.value, module, true);
    const computationTime = result.time;

    result.delete();

    return {
        layout,
        computationTime,
    };
}