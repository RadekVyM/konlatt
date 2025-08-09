import { useMemo, useRef, useState } from "react";
import { cn } from "../utils/tailwind";
import useDimensions from "../hooks/useDimensions";
import "./TextPreviewer.css";

// If I do not include this top offset, it glitches when the first line is scrolled just outside the view
// And it also makes it a bit more visually appealing when scrolling fast
const TOP_DISPLAYED_LINES_BUFFER_COUNT = 5;
const BOTTOM_DISPLAYED_LINES_BUFFER_COUNT = 5;

export default function TextPreviewer(props: {
    lines: Array<string>,
    className?: string,
}) {
    const lineHeight = 22.5;
    const containerRef = useRef<HTMLDivElement>(null);
    const containerDimensions = useDimensions(containerRef);
    const [containerScroll, setContainerScroll] = useState<number>(0);

    const realSkippedLinesCount = Math.floor(Math.max(0, containerScroll) / lineHeight);
    const skippedLinesCount = Math.max(0, realSkippedLinesCount - TOP_DISPLAYED_LINES_BUFFER_COUNT);
    const visibleLinesCount = Math.ceil(containerDimensions.height / lineHeight) + 1 + (realSkippedLinesCount - skippedLinesCount) + BOTTOM_DISPLAYED_LINES_BUFFER_COUNT;

    const displayedLines = useLines(props.lines, skippedLinesCount, visibleLinesCount);

    const maxLineNumberLength = props.lines.length.toString().length;

    return (
        <div
            ref={containerRef}
            className={cn("text-previewer overflow-scroll max-w-full max-h-full pt-2 pl-2", props.className)}
            onScroll={(e) => setContainerScroll(e.currentTarget.scrollTop)}>
            <div
                className="grid min-h-full min-w-full"
                style={{
                    gridTemplateRows: `repeat(${props.lines.length}, ${lineHeight}px) 1fr`,
                }}>
                {displayedLines.map((line, index) =>
                    <span
                        key={skippedLinesCount + index}
                        className="tp-line"
                        data-line={skippedLinesCount + index + 1}
                        style={{
                            gridRowStart: skippedLinesCount + index,
                            gridRowEnd: skippedLinesCount + index + 1,
                            gridTemplateColumns: `${maxLineNumberLength * 0.7}rem auto`,
                            maxHeight: `${lineHeight}px`,
                        }}>
                        <pre>
                            {line}
                        </pre>
                    </span>)}
            </div>
        </div>
    );
}

function useLines(
    lines: Array<string>,
    skippedLinesCount: number,
    visibleLinesCount: number,
) {
    return useMemo(() => {
        return lines.slice(skippedLinesCount, skippedLinesCount + visibleLinesCount);
    }, [lines, skippedLinesCount, visibleLinesCount]);
}