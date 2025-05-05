import { RefObject, useEffect, useRef, useState } from "react";
import { formalContextHasAttribute, FormalContext } from "../../types/FormalContext";
import { cn } from "../../utils/tailwind";
import useDimensions from "../../hooks/useDimensions";
import "./ContextTable.css";
import useContextStore from "../../stores/useContextStore";

type ContextTableCell = {
    column: number,
    row: number,
    checked: boolean,
}

type ContextTableCellHeader = {
    cell: number,
    content: string,
}

export default function ContextTable(props: {
    context: FormalContext,
    className?: string,
}) {
    const cellHeight = 28;
    const cellWidth = 30;
    const containerRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLDivElement>(null);
    const containerDimensions = useDimensions(containerRef);
    const tableDimensions = useDimensions(tableRef);
    const selectedObject = useContextStore((state) => state.selectedObject);
    const selectedAttribute = useContextStore((state) => state.selectedAttribute);
    const setSelection = useContextStore((state) => state.setSelection);
    const [containerScroll, setContainerScroll] = useState<[number, number]>([0, 0]);
    const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const tableContentWidth = props.context.attributes.length * cellWidth;
    const tableContentHeight = props.context.objects.length * cellHeight;
    const columnHeaderSize = tableDimensions.height - tableContentHeight;
    const rowHeaderSize = tableDimensions.width - tableContentWidth;
    const columnHeadersSideways = props.context.attributes.reduce((prev, curr) => Math.max(prev, curr.length), 0) > 2;

    const skippedRowsCount = Math.floor(Math.max(0, containerScroll[1] - columnHeaderSize) / cellHeight);
    const skippedColumnsCount = Math.floor(Math.max(0, containerScroll[0] - rowHeaderSize) / cellWidth);
    const visibleRowsCount = Math.min(Math.ceil(containerDimensions.height / cellHeight) + 1, props.context.objects.length - skippedRowsCount, props.context.objects.length);
    const visibleColumnsCount = Math.min(Math.ceil(containerDimensions.width / cellWidth) + 1, props.context.attributes.length - skippedColumnsCount, props.context.attributes.length);

    const cells = useCells(props.context, skippedRowsCount, skippedColumnsCount, visibleRowsCount, visibleColumnsCount);
    const rowHeaders = useRowHeaders(props.context, skippedRowsCount, visibleRowsCount);
    const columnHeaders = useColumnHeaders(props.context, skippedColumnsCount, visibleColumnsCount);

    useScrollOnSelection(
        selectedObject,
        selectedAttribute,
        containerRef,
        cellWidth,
        cellHeight,
        containerDimensions,
        columnHeaderSize,
        rowHeaderSize);

    function onHoverChange(cell: ContextTableCell | null) {
        if (cell) {
            setHoveredColumn(cell.column);
            setHoveredRow(cell.row);
        }
        else {
            setHoveredColumn(null);
            setHoveredRow(null);
        }
    }

    function onCellClick(cell: ContextTableCell) {
        if (cell.column === selectedAttribute && cell.row === selectedObject) {
            setSelection(null, null);
        }
        else {
            setSelection(cell.row, cell.column);
        }
    }

    // TODO: I have no idea why the column headers are not displayed sideways in Safari 🙃

    // As little elements as possible is used to make it a bit more performant

    return (
        <div
            ref={containerRef}
            className={cn("overflow-auto relative thin-scrollbar text-on-surface-container scroll-smooth", props.className)}
            onScroll={(e) => setContainerScroll([e.currentTarget.scrollLeft, e.currentTarget.scrollTop])}>
            <div
                ref={tableRef}
                role="table"
                aria-label="Context table"
                aria-rowcount={props.context.objects.length}
                aria-colcount={props.context.attributes.length}
                className="grid justify-start min-h-full min-w-fit context-table"
                style={{
                    gridTemplateRows: `auto repeat(${props.context.objects.length}, ${cellHeight}px) 1fr`,
                    gridTemplateColumns: `auto repeat(${props.context.attributes.length}, ${cellWidth}px) 1fr`,
                }}>
                {/* Row highlight */}
                {selectedObject !== null &&
                    <div
                        className="col-start-2 -col-end-2 bg-primary-lite rounded-r-md"
                        style={{
                            gridRowStart: selectedObject + 2,
                            gridRowEnd: selectedObject + 3,
                        }}>
                    </div>}

                {/* Column highlight */}
                {selectedAttribute !== null &&
                    <div
                        className="row-start-2 -row-end-2 bg-primary-lite rounded-b-md"
                        style={{
                            gridColumnStart: selectedAttribute + 2,
                            gridColumnEnd: selectedAttribute + 3,
                        }}>
                    </div>}

                {/* All the cells */}
                {cells.map((cell) =>
                    <TableCell
                        key={`${cell.column} ${cell.row}`}
                        cell={cell}
                        selected={cell.row === selectedObject || cell.column === selectedAttribute}
                        onHoverChange={onHoverChange}
                        onClick={onCellClick} />)}

                {/* Background of the row headers */}
                <div
                    className={cn(
                        "col-start-1 col-end-2 row-start-1 -row-end-1 bg-surface-container sticky left-0",
                        containerScroll[0] > 0 && "border-r border-outline-variant shadow")}>
                </div>

                {/* Row headers */}
                {rowHeaders.map((header) =>
                    <span
                        key={`row-header-${header.cell}`}
                        role="rowheader"
                        className={cn(
                            "rhead",
                            header.cell === selectedObject && "selected rounded-l-md",
                            header.cell === hoveredRow && "hovered")}
                        style={{
                            gridRowStart: header.cell + 2
                        }}
                        title={header.content}>
                        <span>{header.content}</span>
                    </span>)}

                {/* Row dividers */}
                {rowHeaders.map((header) =>
                    <div
                        key={`row-dividers-${header.cell}`}
                        className="row"
                        style={{
                            gridRowStart: header.cell + 2
                        }}>
                    </div>)}

                {/* Background of the column headers */}
                <div
                    className="row-start-1 row-end-2 col-start-1 -col-end-1 bg-surface-container border-b border-outline shadow sticky top-0">
                </div>

                {/* Column headers */}
                {columnHeaders.map((header) =>
                    <div
                        key={`column-header-${header.cell}`}
                        role="columnheader"
                        className={cn(
                            "chead",
                            columnHeadersSideways && "sideways",
                            header.cell === hoveredColumn && "hovered",
                            header.cell === selectedAttribute && "selected rounded-t-md")}
                        style={{
                            gridColumnStart: header.cell + 2
                        }}
                        title={header.content}>
                        {header.content}
                    </div>)}

                {/* That rectangle in the top left corner that hides headers scrolled out of the view */}
                <div
                    className="row-start-1 row-end-2 col-start-1 col-end-2 bg-surface-container border-b border-outline sticky top-0 left-0">
                </div>
            </div>
        </div>
    );
}

function TableCell(props: {
    cell: ContextTableCell,
    selected: boolean,
    onHoverChange: (cell: ContextTableCell | null) => void,
    onClick: (cell: ContextTableCell) => void,
}) {
    function onPointerEnter() {
        props.onHoverChange(props.cell);
    }

    function onPointerLeave() {
        props.onHoverChange(null);
    }

    function onClick() {
        props.onClick(props.cell);
    }

    return (
        <button
            key={`${props.cell.column} ${props.cell.row}`}
            role="cell"
            aria-colindex={props.cell.column + 1}
            aria-rowindex={props.cell.row + 1}
            aria-checked={props.cell.checked}
            className={cn("td", props.cell.checked && "x", props.selected && "selected")}
            style={{
                gridRowStart: props.cell.row + 2,
                gridColumnStart: props.cell.column + 2
            }}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onClick={onClick}>
        </button>
    );
}


function useRowHeaders(
    context: FormalContext,
    skippedRowsCount: number,
    visibleRowsCount: number,
) {
    const cells = new Array<ContextTableCellHeader>();

    for (let row = 0; row < visibleRowsCount; row++) {
        cells.push({
            content: context.objects[row + skippedRowsCount],
            cell: row + skippedRowsCount,
        });
    }

    return cells;
}

function useColumnHeaders(
    context: FormalContext,
    skippedColumnsCount: number,
    visibleColumnsCount: number,
) {
    const cells = new Array<ContextTableCellHeader>();

    for (let column = 0; column < visibleColumnsCount; column++) {
        cells.push({
            content: context.attributes[column + skippedColumnsCount],
            cell: column + skippedColumnsCount,
        });
    }

    return cells;
}

function useCells(
    context: FormalContext,
    skippedRowsCount: number,
    skippedColumnsCount: number,
    visibleRowsCount: number,
    visibleColumnsCount: number,
) {
    const cells = new Array<ContextTableCell>();

    for (let row = 0; row < visibleRowsCount; row++) {
        for (let col = 0; col < visibleColumnsCount; col++) {
            cells.push({
                checked: formalContextHasAttribute(context, row + skippedRowsCount, col + skippedColumnsCount),
                row: row + skippedRowsCount,
                column: col + skippedColumnsCount,
            });
        }
    }

    return cells;
}

function useScrollOnSelection(
    selectedObject: number | null,
    selectedAttribute: number | null,
    containerRef: RefObject<HTMLDivElement | null>,
    cellWidth: number,
    cellHeight: number,
    containerDimensions: { width: number; height: number; },
    columnHeaderSize: number,
    rowHeaderSize: number
) {
    const previousSelectedObjectRef = useRef<number | null>(null);
    const previousSelectedAttributeRef = useRef<number | null>(null);

    useEffect(() => {
        if (containerRef.current && (selectedObject !== null || selectedAttribute !== null)) {
            const left = selectedAttribute !== null && selectedAttribute !== previousSelectedAttributeRef.current ?
                Math.max(0, (selectedAttribute * cellWidth) - ((containerDimensions.width - rowHeaderSize) / 2)) :
                undefined;
            const top = selectedObject !== null && selectedObject !== previousSelectedObjectRef.current ?
                Math.max(0, (selectedObject * cellHeight) - ((containerDimensions.height - columnHeaderSize) / 2)) :
                undefined;

            containerRef.current.scrollTo({
                left: left,
                top: top,
                behavior: "smooth",
            });
        }

        previousSelectedObjectRef.current = selectedObject;
        previousSelectedAttributeRef.current = selectedAttribute;
    }, [selectedObject, selectedAttribute]);
}