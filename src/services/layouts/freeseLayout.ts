import Module from "../../cpp";
import { cppFloatArrayToFloat32Array } from "../../utils/cpp";

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