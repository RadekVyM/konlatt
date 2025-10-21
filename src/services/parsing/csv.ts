import { CsvSeparator } from "../../types/CsvSeparator";
import { FORMAL_CONTEXT_CELL_SIZE, FormalContext } from "../../types/FormalContext";
import { fillWith } from "../../utils/array";
import { readLine } from "../../utils/string";
import { INVALID_FILE_MESSAGE } from "./constants";
import { formalContextSetAttribute } from "./utils";

export default function parseCsv(content: string, separator: CsvSeparator): FormalContext {
    const objects = new Map<string, number>();
    const attributes = new Map<string, number>();
    const pairs = new Array<[number, number]>();

    let lineStart = 0;

    while (lineStart >= 0) {
        const line = readLine(content, lineStart);
        lineStart = line.nextStart;

        const pair = line.line.split(separator).map((v) => v.replace("\r", ""));

        if (pair.length !== 2) {
            throw new Error(`${INVALID_FILE_MESSAGE} Invalid separator.`);
        }

        let objectIndex = objects.get(pair[0]);
        let attributeIndex = attributes.get(pair[1]);

        if (objectIndex === undefined) {
            objectIndex = objects.size;
            objects.set(pair[0], objectIndex);
        }
        if (attributeIndex === undefined) {
            attributeIndex = attributes.size;
            attributes.set(pair[1], attributeIndex);
        }

        pairs.push([objectIndex, attributeIndex]);
    }

    const cellsPerObjectCount = Math.ceil(attributes.size / FORMAL_CONTEXT_CELL_SIZE);
    const context = new Array<number>(objects.size * cellsPerObjectCount);

    fillWith(context, 0);

    for (const pair of pairs) {
        formalContextSetAttribute(context, cellsPerObjectCount, pair[0], pair[1]);
    }

    return {
        context,
        objects: [...objects.keys()],
        attributes: [...attributes.keys()],
        cellsPerObject: cellsPerObjectCount,
        cellSize: FORMAL_CONTEXT_CELL_SIZE,
    };
}