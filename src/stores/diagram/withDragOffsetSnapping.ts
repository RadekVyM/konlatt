import { createPoint, Point } from "../../types/Point";
import { DiagramStore } from "./useDiagramStore";

export default function withDragOffsetSnapping(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const dragOffset = newState.dragOffset === undefined ? oldState.dragOffset : newState.dragOffset;
    const conceptsToMoveBox = newState.conceptsToMoveBox === undefined ? oldState.conceptsToMoveBox : newState.conceptsToMoveBox;

    if (conceptsToMoveBox === null || (dragOffset[0] === 0 && dragOffset[1] === 0 && dragOffset[2] === 0)) {
        return {
            ...newState,
            snapCoords: null,
            isDraggingNodesSnappedToXAxis: false,
            isDraggingNodesSnappedToYAxis: false,
            isDraggingNodesSnappedToZAxis: false,
        };
    }

    const initialAlignPoint = createPoint(
        conceptsToMoveBox.x + (conceptsToMoveBox.width / 2),
        conceptsToMoveBox.y + (conceptsToMoveBox.height / 2),
        conceptsToMoveBox.z + (conceptsToMoveBox.depth / 2));
    const alignPoint = createPoint(
        initialAlignPoint[0] + dragOffset[0],
        initialAlignPoint[1] + dragOffset[1],
        initialAlignPoint[2] + dragOffset[2]);

    const snapX = Math.round(alignPoint[0] * 2) / 2;
    const snapY = Math.round(alignPoint[1] * 2) / 2;
    const snapZ = Math.round(alignPoint[2] * 2) / 2;
    const snapCoords = createPoint(snapX, snapY, snapZ);

    const [dragOffsetX, shouldSnapToX] = getNewDragOffsetCoord(0, initialAlignPoint, alignPoint, snapCoords, dragOffset);
    const [dragOffsetY, shouldSnapToY] = getNewDragOffsetCoord(1, initialAlignPoint, alignPoint, snapCoords, dragOffset);
    const [dragOffsetZ, shouldSnapToZ] = getNewDragOffsetCoord(2, initialAlignPoint, alignPoint, snapCoords, dragOffset);

    const xyPlane = dragOffset[2] === 0;
    const xzPlane = dragOffset[1] === 0;
    const yzPlane = dragOffset[0] === 0;
    const isDraggingNodesSnappedToXAxis = (shouldSnapToY || shouldSnapToZ) && (xyPlane || xzPlane);
    const isDraggingNodesSnappedToYAxis = (shouldSnapToX || shouldSnapToZ) && (xyPlane || yzPlane);
    const isDraggingNodesSnappedToZAxis = (shouldSnapToX || shouldSnapToY) && (xzPlane || yzPlane);

    if (dragOffset[0] === dragOffsetX && dragOffset[1] === dragOffsetY && dragOffset[2] === dragOffsetZ) {
        return {
            ...newState,
            snapCoords,
            isDraggingNodesSnappedToXAxis,
            isDraggingNodesSnappedToYAxis,
            isDraggingNodesSnappedToZAxis,
        };
    }

    return {
        ...newState,
        snapCoords,
        dragOffset: createPoint(dragOffsetX, dragOffsetY, dragOffsetZ),
        isDraggingNodesSnappedToXAxis,
        isDraggingNodesSnappedToYAxis,
        isDraggingNodesSnappedToZAxis,
    };
}

function getNewDragOffsetCoord(coordIndex: number, initialAlignPoint: Point, alignPoint: Point, snapCoords: Point, dragOffset: Point) : [number, boolean] {
    const shouldSnapCoord = shouldSnap(alignPoint[coordIndex], snapCoords[coordIndex]);
    const dragOffsetCoord = shouldSnapCoord ?
        snapCoords[coordIndex] - initialAlignPoint[coordIndex] :
        dragOffset[coordIndex];

    return [dragOffsetCoord, shouldSnapCoord];
}

function shouldSnap(alignPointCoord: number, snapCoord: number) {
    const diff = Math.abs(alignPointCoord - snapCoord);
    return diff > 0 && diff < 0.075;
}