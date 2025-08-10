import { useMemo, useRef, useState } from "react";
import { cn } from "../utils/tailwind";
import useDimensions from "../hooks/useDimensions";
import "./TextPreviewer.css";
import { LuChevronDown } from "react-icons/lu";

type DisplayedLine = {
    text: string,
    row: number,
    lineIndex: number,
    isCollapsed: boolean | null,
}

// If I do not include this top offset, it glitches when the first line is scrolled just outside the view
// And it also makes it a bit more visually appealing when scrolling fast
const TOP_DISPLAYED_LINES_BUFFER_COUNT = 5;
const BOTTOM_DISPLAYED_LINES_BUFFER_COUNT = 5;

export default function TextPreviewer(props: {
    lines: Array<string>,
    collapseRegions: Map<number, number> | null,
    className?: string,
}) {
    const lineHeight = 22.5;
    const containerRef = useRef<HTMLDivElement>(null);
    const containerDimensions = useDimensions(containerRef);
    const [containerScroll, setContainerScroll] = useState<number>(0);

    const realSkippedLinesCount = Math.floor(Math.max(0, containerScroll) / lineHeight);
    const skippedLinesCount = Math.max(0, realSkippedLinesCount - TOP_DISPLAYED_LINES_BUFFER_COUNT);
    const visibleLinesCount = Math.ceil(containerDimensions.height / lineHeight) + 1 + (realSkippedLinesCount - skippedLinesCount) + BOTTOM_DISPLAYED_LINES_BUFFER_COUNT;

    const { maxLinesCount, displayedLines, toggleLine } = useLines(props.lines, props.collapseRegions, skippedLinesCount, visibleLinesCount);

    const maxLineNumberLength = props.lines.length.toString().length;

    return (
        <div
            ref={containerRef}
            className={cn("text-previewer overflow-scroll max-w-full max-h-full pt-2 pl-2", props.className)}
            onScroll={(e) => setContainerScroll(e.currentTarget.scrollTop)}>
            <div
                className="grid min-h-full min-w-full"
                style={{
                    gridTemplateRows: `repeat(${maxLinesCount}, ${lineHeight}px) 1fr`,
                }}>
                {displayedLines.map((line) =>
                    <Line
                        key={line.row}
                        line={line}
                        rowStart={line.row}
                        maxLineNumberLength={maxLineNumberLength}
                        lineHeight={lineHeight}
                        toggleLine={toggleLine} />)}
            </div>
        </div>
    );
}

function Line(props: {
    line: DisplayedLine,
    rowStart: number,
    maxLineNumberLength: number,
    lineHeight: number,
    toggleLine: (lineNumber: number) => void,
}) {
    return (
        <span
            className="tp-line"
            data-line={props.line.lineIndex + 1}
            style={{
                gridRowStart: props.rowStart,
                gridRowEnd: props.rowStart + 1,
                gridTemplateColumns: `${props.maxLineNumberLength * 0.7}rem calc(var(--spacing) * 8) auto`,
                maxHeight: `${props.lineHeight}px`,
            }}>
            {props.line.isCollapsed !== null &&
                <button
                    onClick={() => props.toggleLine(props.line.lineIndex)}>
                    <LuChevronDown
                        className={cn(props.line.isCollapsed && "-rotate-90")} />
                </button>}
            <pre>
                {props.line.text}{props.line.isCollapsed && <span className="tp-line-dots">…</span>}
            </pre>
        </span>
    );
}

function useLines(
    lines: Array<string>,
    collapseRegions: Map<number, number> | null,
    skippedLinesCount: number,
    visibleLinesCount: number,
) {
    const [collapsedLines, setCollapsedLines] = useState<Set<number>>(new Set());

    const sortedCollapsedLines = useMemo(() => {
        const sorted = [...collapsedLines.values()];

        sorted.sort((a, b) => a - b);

        return sorted;
    }, [collapsedLines]);

    const collapsedLinesCount = useMemo(() => {
        if (!collapseRegions || sortedCollapsedLines.length === 0) {
            return 0;
        }

        let lastRegionEnd = 0;
        let newCollapsedLinesCount = 0;

        for (let collapsedIndex = 0; collapsedIndex < sortedCollapsedLines.length; collapsedIndex++) {
            const regionStart = sortedCollapsedLines[collapsedIndex];

            if (regionStart < lastRegionEnd) {
                continue;
            }

            const regionEnd = collapseRegions.get(regionStart)!;
            const count = regionEnd - regionStart - 1;

            newCollapsedLinesCount += count;
            lastRegionEnd = regionEnd;
        }

        return newCollapsedLinesCount;
    }, [sortedCollapsedLines, collapseRegions]);

    const maxLinesCount = lines.length - collapsedLinesCount;

    const displayedLines = useMemo(() => {
        const newDisplayedLines = new Array<DisplayedLine>();

        let skippedCollapsedLinesCount = 0;
        let collapsedIndex = 0;

        // Find out how many collapsed lines are skipped (outside the viewport at the top)
        if (collapseRegions && sortedCollapsedLines.length > 0) {
            let lastRegionEnd = 0;

            for (collapsedIndex = 0; collapsedIndex < sortedCollapsedLines.length; collapsedIndex++) {
                const regionStart = sortedCollapsedLines[collapsedIndex];

                if (regionStart - skippedCollapsedLinesCount >= skippedLinesCount) {
                    break;
                }

                if (regionStart < lastRegionEnd) {
                    continue;
                }

                if (regionStart - skippedCollapsedLinesCount < skippedLinesCount) {
                    const regionEnd = collapseRegions.get(regionStart)!;
                    const count = regionEnd - regionStart - 1;

                    skippedCollapsedLinesCount += count;
                    lastRegionEnd = regionEnd;
                }
            }
        }

        let offset = 0;
        let start = skippedLinesCount + skippedCollapsedLinesCount;

        // Select lines that are in the viewport and are not collapsed
        for (let i = 0; i < visibleLinesCount; i++) {
            let index = start + i + offset;

            if (collapseRegions && sortedCollapsedLines.length > 0 && collapsedIndex < sortedCollapsedLines.length) {
                const regionStart = sortedCollapsedLines[collapsedIndex];

                if (regionStart === index) {
                    // Increase the index offset that will be used in the following iterations
                    const regionEnd = collapseRegions.get(regionStart)!;
                    const count = regionEnd - regionStart - 1;
                    offset += count;

                    while (collapsedIndex < sortedCollapsedLines.length && sortedCollapsedLines[collapsedIndex] < regionEnd) {
                        collapsedIndex++;
                    }
                }
            }

            if (index >= lines.length) {
                break;
            }

            newDisplayedLines.push({
                text: lines[index],
                row: skippedLinesCount + 1 + i,
                lineIndex: index,
                isCollapsed: collapseRegions?.has(index) ? collapsedLines.has(index) : null,
            });
        }

        return newDisplayedLines;
    }, [lines, skippedLinesCount, visibleLinesCount, collapseRegions, sortedCollapsedLines, collapsedLines, maxLinesCount]);

    function toggleLine(lineIndex: number) {
        setCollapsedLines((old) => {
            const newSet = new Set(old);

            if (newSet.has(lineIndex)) {
                newSet.delete(lineIndex);
            }
            else {
                newSet.add(lineIndex);
            }

            return newSet;
        });
    }

    return {
        maxLinesCount: maxLinesCount,
        displayedLines,
        toggleLine,
    };
}