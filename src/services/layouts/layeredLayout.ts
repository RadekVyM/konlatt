import Module from "../../cpp";
import { cppFloatArrayToPoints } from "../../utils/cpp";
import { Point } from "../../types/Point";
import { LayeredLayoutPlacement } from "../../types/diagram/LayeredLayoutPlacement";

export async function computeLayeredLayout(
    conceptsCount: number,
    supremum: number,
    subconceptsMappingArrayBuffer: Int32Array,
    placement: LayeredLayoutPlacement,
    onProgress: (progress: number) => void,
): Promise<{
    layout: Array<Point>,
    computationTime: number,
}> {
    const module = await Module();
    const result = new module.FloatArrayTimedResult();

    module.computeLayeredLayout(result, supremum, conceptsCount, subconceptsMappingArrayBuffer, placement, onProgress);
    const layout = cppFloatArrayToPoints(result.value, conceptsCount, true);
    const computationTime = result.time;

    result.delete();

    return {
        layout,
        computationTime,
    };
}