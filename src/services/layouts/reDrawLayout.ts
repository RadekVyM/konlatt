import Module from "../../cpp";
import { cppFloatArrayToFloat32Array } from "../../utils/cpp";

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