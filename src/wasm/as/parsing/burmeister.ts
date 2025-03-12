import { FORMAL_CONTEXT_CELL_SIZE, FormalContext } from "../types/FormalContext";

const INVALID_FILE_MESSAGE = "This file is not valid.";
const INVALID_FILE_LINE_MESSAGE = "This file is not valid. Line:";

export function parseBurmeister(content: string): FormalContext {
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

    const objectsCount = <i32>parseInt(objectsCountLine.line);
    const attributesCount = <i32>parseInt(attributesCountLine.line);
    
    if (!isFinite(objectsCount) || !isFinite(attributesCount))
        throw new Error(`${INVALID_FILE_LINE_MESSAGE} 2 or 3`);

    return parseContext(objectsCount, attributesCount, content, emptyLine.nextStart);
}

function parseContext(objectsCount: i32, attributesCount: i32, content: string, start: i32): FormalContext {
    const cellsPerObjectCount = <i32>Math.ceil(<f64>attributesCount / FORMAL_CONTEXT_CELL_SIZE);
    const context = new StaticArray<u32>(objectsCount * cellsPerObjectCount);
    const objects = new StaticArray<string>(objectsCount);
    const attributes = new StaticArray<string>(attributesCount);

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
        let offset = 0;
        let value: u32 = 0;

        if (lineContent.length < attributesCount)
            throw new Error(`${INVALID_FILE_MESSAGE} Context could not be parsed.`);

        for (let j = 0; j < attributesCount; j++) {
            const char = lineContent.at(j).toLowerCase();

            if (char === ".") {
                offset++;
            }
            else if (char === "x") {
                value = value | (1 << offset);
                offset++;
            }
            else {
                throw new Error(`${INVALID_FILE_MESSAGE} Context could not be parsed.`);
            }

            if (offset === FORMAL_CONTEXT_CELL_SIZE) {
                context[i * cellsPerObjectCount + contextOffset] = value;
                contextOffset++;
                value= 0;
                offset = 0;
            }
        }

        context[i * cellsPerObjectCount + contextOffset] = value;
        start = line.nextStart;
    }

    return {
        context,
        objects,
        attributes,
        cellsPerObject: cellsPerObjectCount,
        cellSize: FORMAL_CONTEXT_CELL_SIZE
    };
}

function readLine(content: string, start: i32): ReadLineResult {
    let end = start;

    while (end < content.length && content.at(end) !== "\n") {
        end++;
    }

    const line = content.substring(start, end);
    end++;
    const nextStart: i32 = end >= content.length ? -1 : end;

    return new ReadLineResult(line, nextStart);
}

class ReadLineResult {
    constructor(public line: string, public nextStart: i32) {}
}