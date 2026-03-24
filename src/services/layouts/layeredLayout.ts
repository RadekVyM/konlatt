import Module from "../../cpp";
import { cppFloatArrayToFloat32Array } from "../../utils/cpp";
import { LayeredLayoutPlacement } from "../../types/diagram/LayeredLayoutPlacement";


/**
 * Executes the layered layout algorithm (Sugiyama framework) via WebAssembly to compute 
 * coordinates for a concept lattice.
 * @param conceptsCount - The total number of concepts in the lattice.
 * @param supremum - The index of the supremum of the lattice.
 * @param subconceptsRelationArrayBuffer - A flattened adjacency relation buffer 
 * representing the subconcept hierarchy.
 * @param placement - Type of the horizontal coordinate assignment method.
 * @param onProgress - Callback function to track the computation's progress (0.0 to 1.0).
 * @returns A promise resolving to the computed layout coordinates and the execution 
 * time in milliseconds.
 */
export async function computeLayeredLayout(
    conceptsCount: number,
    supremum: number,
    subconceptsRelationArrayBuffer: Int32Array,
    placement: LayeredLayoutPlacement,
    onProgress: (progress: number) => void,
): Promise<{
    layout: Float32Array,
    computationTime: number,
}> {
    const module = await Module();
    const result = new module.FloatArrayTimedResult();

    module.computeLayeredLayout(result, supremum, conceptsCount, subconceptsRelationArrayBuffer, placement, onProgress);
    const layout = cppFloatArrayToFloat32Array(result.value, module, true);
    const computationTime = result.time;

    result.delete();

    return {
        layout,
        computationTime,
    };
}