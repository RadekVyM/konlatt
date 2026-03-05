import Module from "../../cpp";
import { cppFloatArrayToFloat32Array } from "../../utils/cpp";
import { LayeredLayoutPlacement } from "../../types/diagram/LayeredLayoutPlacement";

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