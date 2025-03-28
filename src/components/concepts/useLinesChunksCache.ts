import { useCallback, useEffect, useRef, useState } from "react";
import { ConceptLattice } from "../../types/ConceptLattice";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { Point } from "../../types/Point";
import { Rect } from "../../types/Rect";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const CHUNK_SIZE = 10;
const CHUNK_SIZE_HALF = CHUNK_SIZE / 2;

type LinkSegment = {
    fromNode: number,
    toNode: number,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
}

type Chunk = {
    x: number,
    y: number,
    linkSegments: Array<LinkSegment>,
    // better canvas cache...
    scale: number,
    canvas?: HTMLCanvasElement,
}

type ChunkRender = {
    x: number,
    y: number,
    canvas?: HTMLCanvasElement,
}

export default function useLinesChunksCache(
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    lattice: ConceptLattice,
    visibleRect: Rect,
    width: number,
    height: number,
    scale: number,
    layoutScale: number,
) {
    const [chunks, setChunks] = useState<Array<Chunk>>([]);
    const [visibleChunks, setVisibleChunks] = useState<Array<Chunk>>([]);
    const [chunksToRender, setChunksToRender] = useState<Array<ChunkRender>>([]);
    const horizontalChunksCountRef = useRef<number>(0);
    const verticalChunksCountRef = useRef<number>(0);
    const debouncedScale = useDebouncedValue(scale, 200);

    // recreate chunks
    useEffect(() => {
        const bounds = getLayoutBounds(layout, diagramOffsets);
        const horizontalBoundDistance = Math.max(Math.abs(bounds.x), bounds.width - Math.abs(bounds.x));
        const verticalBoundDistance = Math.max(Math.abs(bounds.y), bounds.height - Math.abs(bounds.y));
        const horizontalHalfChunksCount = Math.ceil(Math.max(0, horizontalBoundDistance - CHUNK_SIZE_HALF) / CHUNK_SIZE);
        const verticalHalfChunksCount = Math.ceil(Math.max(0, verticalBoundDistance - CHUNK_SIZE_HALF) / CHUNK_SIZE);
        horizontalChunksCountRef.current = 1 + (2 * horizontalHalfChunksCount);
        verticalChunksCountRef.current = 1 + (2 * verticalHalfChunksCount);

        const newChunks = createChunks(
            horizontalHalfChunksCount,
            verticalHalfChunksCount,
            horizontalChunksCountRef.current,
            verticalChunksCountRef.current);

        // TODO: compute the link segments
        // This crashes on nom5bikesharing_day_cut.cxt and mushroomsep
        // out of memory
        // I can try to not save the segments and render them directly when visibleChunks or scale changes
        // It will probably be slower and more complex, but the benefit of caching should be kept (at least a bit?)
        for (let conceptIndex = 0; conceptIndex < lattice.subconceptsMapping.length; conceptIndex++) {
            const subconcepts = lattice.subconceptsMapping[conceptIndex];
            const startX = layout[conceptIndex][0] + diagramOffsets[conceptIndex][0];
            const startY = layout[conceptIndex][1] + diagramOffsets[conceptIndex][1];
            const startChunkX = getChunkIndex(startX, horizontalChunksCountRef.current);
            const startChunkY = getChunkIndex(startY, verticalChunksCountRef.current);

            for (const subconceptIndex of subconcepts) {
                const endX = layout[subconceptIndex][0] + diagramOffsets[subconceptIndex][0];
                const endY = layout[subconceptIndex][1] + diagramOffsets[subconceptIndex][1];
                const endChunkX = getChunkIndex(endX, horizontalChunksCountRef.current);
                const endChunkY = getChunkIndex(endY, verticalChunksCountRef.current);

                let prevX = startX;
                let prevY = startY;
                let chunkX = startChunkX;
                let chunkY = startChunkY;
                const moveDirectionX = Math.sign(endChunkX - startChunkX);
                const moveDirectionY = Math.sign(endChunkY - startChunkY);

                while (chunkX !== endChunkX || chunkY !== endChunkY) {
                    const currentChunk = newChunks[(chunkY * horizontalChunksCountRef.current) + chunkX];
                    let newX = 0;
                    let newY = 0;

                    if (moveDirectionX === 0) {
                        newY = moveDirectionY > 0 ? currentChunk.y + CHUNK_SIZE : currentChunk.y;
                        newX = lineEquation(startX, endX, getRelativePosition(startY, endY, newY));
                        chunkY += moveDirectionY;
                    }
                    else if (moveDirectionY === 0) {
                        newX = moveDirectionX > 0 ? currentChunk.x + CHUNK_SIZE : currentChunk.x;
                        newY = lineEquation(startY, endY, getRelativePosition(startX, endX, newX));
                        chunkX += moveDirectionX;
                    }
                    else {
                        const gridX = moveDirectionX > 0 ? currentChunk.x + CHUNK_SIZE : currentChunk.x;
                        const gridY = moveDirectionY > 0 ? currentChunk.y + CHUNK_SIZE : currentChunk.y;
                        newX = lineEquation(startX, endX, getRelativePosition(startY, endY, gridY));
                        newY = lineEquation(startY, endY, getRelativePosition(startX, endX, gridX));

                        const gridXPointDistance = pointDistance(startX, startY, gridX, newY);
                        const gridYPointDistance = pointDistance(startX, startY, newX, gridY);

                        if (endChunkX - startChunkX === endChunkY - startChunkY) {
                            chunkX += moveDirectionX;
                            chunkY += moveDirectionY;

                            newX = gridX;
                            newY = gridY;
                        }
                        else if (gridXPointDistance < gridYPointDistance) {
                            chunkX += moveDirectionX;
                            newX = gridX;
                        }
                        else if (gridXPointDistance > gridYPointDistance) {
                            chunkY += moveDirectionY;
                            newY = gridY;
                        }
                    }

                    addLineToChunk(
                        currentChunk,
                        conceptIndex,
                        subconceptIndex,
                        prevX,
                        prevY,
                        newX,
                        newY
                    );

                    prevX = newX;
                    prevY = newY;
                }

                addLineToChunk(
                    newChunks[(chunkY * horizontalChunksCountRef.current) + chunkX],
                    conceptIndex,
                    subconceptIndex,
                    prevX,
                    prevY,
                    endX,
                    endY
                );
            }
        }

        setChunks(newChunks);
    }, [layout, diagramOffsets, lattice.subconceptsMapping]);

    useEffect(() => {
        setVisibleChunks((old) => {
            const startHorizontalIndex = getChunkIndex(visibleRect.x, horizontalChunksCountRef.current);
            const startVerticalIndex = getChunkIndex(visibleRect.y, verticalChunksCountRef.current);
            const endHorizontalIndex = getChunkIndex(visibleRect.x + visibleRect.width, horizontalChunksCountRef.current);
            const endVerticalIndex = getChunkIndex(visibleRect.y + visibleRect.height, verticalChunksCountRef.current);

            const array = new Array<Chunk>();

            for (let i = Math.max(0, startVerticalIndex); i <= endVerticalIndex; i++) {
                for (let j = Math.max(0, startHorizontalIndex); j <= endHorizontalIndex; j++) {
                    const index = (i * horizontalChunksCountRef.current) + j;
                    if (index >= 0 && index < chunks.length) {
                        array.push(chunks[index]);
                    }
                }
            }

            return areEqual(old, array) ? old : array;
        });
    }, [visibleRect, chunks]);

    useEffect(() => {
        const chunkCanvasSize = Math.ceil(debouncedScale * layoutScale * CHUNK_SIZE);
        const arrays = new Array<ChunkRender>();

        for (const chunk of visibleChunks) {
            if (chunk.scale !== debouncedScale) {
                // TODO: Skip if there are no link segments

                if (!chunk.canvas) {
                    chunk.canvas = document.createElement("canvas");
                }

                chunk.canvas.width = chunkCanvasSize;
                chunk.canvas.height = chunkCanvasSize;
                const context = chunk.canvas.getContext("2d")!;

                context.clearRect(0, 0, chunkCanvasSize, chunkCanvasSize);

                // TODO: draw the links
                context.lineWidth = 4 * debouncedScale;
                context.strokeRect(0, 0, chunkCanvasSize, chunkCanvasSize);
                context.lineWidth = 1 * debouncedScale;
                context.strokeStyle = "gray";

                for (const segment of chunk.linkSegments) {
                    context.beginPath();
                    context.moveTo(segment.fromX * layoutScale * debouncedScale, segment.fromY * layoutScale * debouncedScale);
                    context.lineTo(segment.toX * layoutScale * debouncedScale, segment.toY * layoutScale * debouncedScale);
                    context.stroke();
                }

                chunk.scale = debouncedScale;
            }

            arrays.push({
                x: chunk.x * layoutScale,
                y: chunk.y * layoutScale,
                canvas: chunk.canvas,
            });
        }

        setChunksToRender(arrays);
    }, [visibleChunks, layoutScale, debouncedScale]);

    return useCallback((context: CanvasRenderingContext2D) => {
        const chunkSize = layoutScale * CHUNK_SIZE;
        const centerX = width / 2;
        const centerY = height / 2;

        for (const chunk of chunksToRender) {
            if (!chunk.canvas || chunk.canvas.width === 0 || chunk.canvas.height === 0) {
                continue;
            }

            context.drawImage(chunk.canvas, chunk.x + centerX, chunk.y + centerY, chunkSize, chunkSize);
        }
    }, [chunksToRender, width, height]);
}

function getLayoutBounds(
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
): Rect {
    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    for (let i = 0; i < layout.length; i++) {
        const x = layout[i][0] + diagramOffsets[i][0];
        const y = layout[i][1] + diagramOffsets[i][1];

        minX = Math.min(x, minX);
        maxX = Math.max(x, maxX);
        minY = Math.min(y, minY);
        maxY = Math.max(y, maxY);
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

function getChunkIndex(coord: number, chunksCount: number) {
   return Math.floor((coord + (chunksCount * CHUNK_SIZE) / 2) / CHUNK_SIZE);
}

function createChunks(
    horizontalHalfChunksCount: number,
    verticalHalfChunksCount: number,
    horizontalChunksCount: number,
    verticalChunksCount: number,
) {
    const newChunks = new Array<Chunk>(horizontalChunksCount * verticalChunksCount);

    const left = -CHUNK_SIZE_HALF - (horizontalHalfChunksCount * CHUNK_SIZE);
    const top = -CHUNK_SIZE_HALF - (verticalHalfChunksCount * CHUNK_SIZE);

    for (let i = 0; i < verticalChunksCount; i++) {
        for (let j = 0; j < horizontalChunksCount; j++) {
            newChunks[(i * horizontalChunksCount) + j] = {
                linkSegments: [],
                x: left + (j * CHUNK_SIZE),
                y: top + (i * CHUNK_SIZE),
                scale: 0,
            };
        }
    }

    return newChunks;
}

function areEqual(first: Array<any>, second: Array<any>) {
    if (first.length !== second.length) {
        return false;
    }

    for (let i = 0; i < first.length; i++) {
        if (first[i] !== second[i]) {
            return false;
        }
    }

    return true;
}

function addLineToChunk(
    chunk: Chunk,
    from: number,
    to: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
) {
    chunk.linkSegments.push({
        fromNode: from,
        toNode: to,
        fromX: startX - chunk.x,
        fromY: startY - chunk.y,
        toX: endX - chunk.x,
        toY: endY - chunk.y,
    });
}

function getRelativePosition(start: number, end: number, position: number) {
    return (position - start) / (end - start);
}

function lineEquation(start: number, end: number, relativePosition: number) {
    return start + (relativePosition * (end - start));
}

function pointDistance(
    firstX: number,
    firstY: number,
    secondX: number,
    secondY: number,
) {
    return Math.sqrt(Math.pow(secondX - firstX, 2) + Math.pow(secondY - firstY, 2));
}