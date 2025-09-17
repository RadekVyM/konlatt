import { FORMAL_CONTEXT_CELL_SIZE, FormalContext } from "../../types/FormalContext";
import { readLine } from "../../utils/string";
import { INVALID_FILE_MESSAGE } from "./constants";

const INVALID_FILE_LINE_MESSAGE = `${INVALID_FILE_MESSAGE} Line:`;

export default function parseBurmeister(content: string): FormalContext {
    content = content.trim();
    const bLine = readLine(content, 0);
    if (bLine.line.trim().toLowerCase() !== "b")
        throw new Error(`${INVALID_FILE_LINE_MESSAGE} 0`);
    if (bLine.nextStart === -1)
        throw new Error(`${INVALID_FILE_LINE_MESSAGE} 1`);

    const nameLine = readLine(content, bLine.nextStart);
    if (nameLine.nextStart === -1)
        throw new Error(`${INVALID_FILE_LINE_MESSAGE} 2`);

    const objectsCountLine = readLine(content, nameLine.nextStart);
    if (objectsCountLine.nextStart === -1)
        throw new Error(`${INVALID_FILE_LINE_MESSAGE} 3`);

    const attributesCountLine = readLine(content, objectsCountLine.nextStart);
    if (attributesCountLine.nextStart === -1)
        throw new Error(`${INVALID_FILE_LINE_MESSAGE} 4`);

    const emptyLine = readLine(content, attributesCountLine.nextStart);
    if (emptyLine.nextStart === -1)
        throw new Error(`${INVALID_FILE_LINE_MESSAGE} 5`);

    const objectsCount = parseInt(objectsCountLine.line);
    const attributesCount = parseInt(attributesCountLine.line);

    if (!isFinite(objectsCount) || !isFinite(attributesCount))
        throw new Error(`${INVALID_FILE_LINE_MESSAGE} 2 or 3`);

    return parseContext(objectsCount, attributesCount, content, emptyLine.nextStart);
}

function parseContext(objectsCount: number, attributesCount: number, content: string, start: number): FormalContext {
    const cellsPerObjectCount = Math.ceil(attributesCount / FORMAL_CONTEXT_CELL_SIZE);
    const context = new Array<number>(objectsCount * cellsPerObjectCount);
    const objects = new Array<string>(objectsCount);
    const attributes = new Array<string>(attributesCount);

    for (let i = 0; i < objectsCount; i++) {
        const line = readLine(content, start);

        if (line.nextStart === -1)
            throw new Error(`${INVALID_FILE_MESSAGE} Objects could not be parsed.`);

        objects[i] = line.line.trim();
        start = line.nextStart;
    }

    for (let i = 0; i < attributesCount; i++) {
        const line = readLine(content, start);

        if (line.nextStart === -1)
            throw new Error(`${INVALID_FILE_MESSAGE} Attributes could not be parsed.`);

        attributes[i] = line.line.trim();
        start = line.nextStart;
    }

    for (let i = 0; i < objectsCount; i++) {
        if (start === -1)
            throw new Error(`${INVALID_FILE_MESSAGE} Context could not be parsed.`);

        const line = readLine(content, start);
        const lineContent = line.line.trim();
        let contextOffset = 0;
        let offset = 0n;
        let value = 0n;

        if (lineContent.length < attributesCount)
            throw new Error(`${INVALID_FILE_MESSAGE} Context could not be parsed.`);

        for (let j = 0; j < attributesCount; j++) {
            const char = lineContent[j].toLowerCase();

            if (char === ".") {
                offset++;
            }
            else if (char === "x") {
                value = value | (1n << offset);
                offset++;
            }
            else {
                throw new Error(`${INVALID_FILE_MESSAGE} Context could not be parsed.`);
            }

            if (offset === BigInt(FORMAL_CONTEXT_CELL_SIZE)) {
                context[i * cellsPerObjectCount + contextOffset] = Number(value);
                contextOffset++;
                value = 0n;
                offset = 0n;
            }
        }

        context[i * cellsPerObjectCount + contextOffset] = Number(value);
        start = line.nextStart;
    }

    return {
        context,
        objects,
        attributes,
        cellsPerObject: cellsPerObjectCount,
        cellSize: FORMAL_CONTEXT_CELL_SIZE,
    };
}