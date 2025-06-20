import Module from "../../cpp";
import { cppFloatArrayToPoints } from "../../utils/cpp";
import { Point } from "../../types/Point";

export async function computeLayeredLayout(
    conceptsCount: number,
    supremum: number,
    subconceptsMappingArrayBuffer: Int32Array,
): Promise<{
    layout: Array<Point>,
    computationTime: number,
}> {
    const module = await Module();

    const result = module.computeLayeredLayout(supremum, conceptsCount, subconceptsMappingArrayBuffer);
    const layout = cppFloatArrayToPoints(result.value, conceptsCount, true);

    return {
        layout,
        computationTime: result.time,
    };
}