import Module from "../../cpp";
import { cppFloatArrayToPoints } from "../../utils/cpp";
import { Point } from "../../types/Point";

export async function computeLayeredLayout(
    conceptsCount: number,
    supremum: number,
    subconceptsMappingArrayBuffer: Int32Array,
    placement: "bk" | "simple"
): Promise<{
    layout: Array<Point>,
    computationTime: number,
}> {
    const module = await Module();
    const result = new module.FloatArrayTimedResult();

    module.computeLayeredLayout(result, supremum, conceptsCount, subconceptsMappingArrayBuffer, placement);
    const layout = cppFloatArrayToPoints(result.value, conceptsCount, true);
    const computationTime = result.time;

    result.delete();

    return {
        layout,
        computationTime,
    };
}