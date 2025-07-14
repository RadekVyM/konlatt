import Module from "../../cpp";
import { cppFloatArrayToPoints } from "../../utils/cpp";
import { Point } from "../../types/Point";

export async function computeFreeseLayout(
    conceptsCount: number,
    supremum: number,
    subconceptsMappingArrayBuffer: Int32Array,
): Promise<{
    layout: Array<Point>,
    computationTime: number,
}> {
    const module = await Module();
    const result = new module.FloatArrayTimedResult();

    module.computeFreeseLayout(result, supremum, conceptsCount, subconceptsMappingArrayBuffer);
    const layout = cppFloatArrayToPoints(result.value, conceptsCount, true);
    const computationTime = result.time;

    result.delete();

    return {
        layout,
        computationTime,
    };
}