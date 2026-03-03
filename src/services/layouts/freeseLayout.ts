import Module from "../../cpp";
import { cppFloatArrayToPoints } from "../../utils/cpp";
import { Point } from "../../types/Point";

export async function computeFreeseLayout(
    conceptsCount: number,
    supremum: number,
    infimum: number,
    subconceptsRelationArrayBuffer: Int32Array,
    onProgress: (progress: number) => void,
): Promise<{
    layout: Array<Point>,
    computationTime: number,
}> {
    const module = await Module();
    const result = new module.FloatArrayTimedResult();

    module.computeFreeseLayout(result, supremum, infimum, conceptsCount, subconceptsRelationArrayBuffer, onProgress);
    const layout = cppFloatArrayToPoints(result.value, conceptsCount, true);
    const computationTime = result.time;

    result.delete();

    return {
        layout,
        computationTime,
    };
}