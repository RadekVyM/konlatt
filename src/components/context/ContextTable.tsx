import { RefObject, useEffect, useRef, useState } from "react";
import { formalContextHasAttribute, RawFormalContext } from "../../types/RawFormalContext";
import { cn } from "../../utils/tailwind";
import useDimensions from "../../hooks/useDimensions";
import "./ContextTable.css";

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
    context: RawFormalContext,
    selectedObject: number | null,
    selectedAttribute: number | null,
    className?: string,
    setSelectedObject: React.Dispatch<React.SetStateAction<number | null>>,
    setSelectedAttribute: React.Dispatch<React.SetStateAction<number | null>>,
}) {
    const cellHeight = 28;
    const cellWidth = 30;
    const containerRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLDivElement>(null);
    const containerDimensions = useDimensions(containerRef);
    const tableDimensions = useDimensions(tableRef);
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
        props.selectedObject,
        props.selectedAttribute,
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
        if (cell.column === props.selectedAttribute && cell.row === props.selectedObject) {
            props.setSelectedAttribute(null);
            props.setSelectedObject(null);
        }
        else {
            props.setSelectedAttribute(cell.column);
            props.setSelectedObject(cell.row);
        }
    }

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
                {props.selectedObject !== null &&
                    <div
                        className="col-start-2 -col-end-2 bg-primary-lite rounded-r-md"
                        style={{
                            gridRowStart: props.selectedObject + 2,
                            gridRowEnd: props.selectedObject + 3,
                        }}>
                    </div>}

                {props.selectedAttribute !== null &&
                    <div
                        className="row-start-2 -row-end-2 bg-primary-lite rounded-b-md"
                        style={{
                            gridColumnStart: props.selectedAttribute + 2,
                            gridColumnEnd: props.selectedAttribute + 3,
                        }}>
                    </div>}

                {cells.map((cell) =>
                    <TableCell
                        key={`${cell.column} ${cell.row}`}
                        cell={cell}
                        selected={cell.row === props.selectedObject || cell.column === props.selectedAttribute}
                        onHoverChange={onHoverChange}
                        onClick={onCellClick} />)}

                <div
                    className={cn(
                        "col-start-1 col-end-2 row-start-1 -row-end-1 bg-surface-container sticky left-0",
                        containerScroll[0] > 0 && "border-r border-outline-variant shadow")}>
                </div>

                {rowHeaders.map((header) =>
                    <span
                        key={header.cell}
                        role="rowheader"
                        className={cn(
                            "rh",
                            header.cell === props.selectedObject && "selected rounded-l-md",
                            header.cell === hoveredRow && "hovered")}
                        style={{
                            gridRowStart: header.cell + 2
                        }}
                        title={header.content}>
                        <span className="rhc">{header.content}</span>
                    </span>)}
                
                {rowHeaders.map((header) =>
                    <div
                        key={header.cell}
                        className="row"
                        style={{
                            gridRowStart: header.cell + 2
                        }}>
                    </div>)}

                <div
                    className="row-start-1 row-end-2 col-start-1 -col-end-1 bg-surface-container border-b border-outline shadow sticky top-0">
                </div>

                {columnHeaders.map((header) =>
                    <div
                        key={header.cell}
                        role="columnheader"
                        className={cn(
                            "ch",
                            columnHeadersSideways && "s",
                            header.cell === hoveredColumn && "hovered",
                            header.cell === props.selectedAttribute && "selected rounded-t-md")}
                        style={{
                            gridColumnStart: header.cell + 2
                        }}
                        title={header.content}>
                        {header.content}
                    </div>)}

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
    context: RawFormalContext,
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
    context: RawFormalContext,
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
    context: RawFormalContext,
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