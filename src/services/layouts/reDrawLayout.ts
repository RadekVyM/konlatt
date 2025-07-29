import Module from "../../cpp";
import { cppFloatArrayToPoints } from "../../utils/cpp";
import { Point } from "../../types/Point";

export async function computeReDrawLayout(
    conceptsCount: number,
    supremum: number,
    infimum: number,
    subconceptsMappingArrayBuffer: Int32Array,
    seed: number,
    targetDimension: 2 | 3,
    parallelize: boolean,
    onProgress: (progress: number) => void,
): Promise<{
    layout: Array<Point>,
    computationTime: number,
}> {
    const module = await Module();
    const result = new module.FloatArrayTimedResult();

    module.computeReDrawLayout(result, supremum, infimum, conceptsCount, subconceptsMappingArrayBuffer, seed, targetDimension, parallelize, onProgress);
    const layout = cppFloatArrayToPoints(result.value, conceptsCount, true);
    const computationTime = result.time;

    result.delete();

    return {
        layout,
        computationTime,
    };
}