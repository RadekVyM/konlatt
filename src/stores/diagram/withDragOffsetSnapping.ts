import { createPoint, Point } from "../../types/Point";
import { withFallback } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";

const SNAP_THRESHOLD = 0.075;

/**
 * Calculates 3D snapping logic for a drag operation.
 * It determines if the current drag offset should "snap" to a half-unit grid based on 
 * the center of the bounding box of the concepts being moved. It also identifies 
 * which planes or axes the drag is currently restricted to.
 */
export default function withDragOffsetSnapping(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const dragOffset = withFallback(newState.dragOffset, oldState.dragOffset);
    const conceptsToMoveBox = withFallback(newState.conceptsToMoveBox, oldState.conceptsToMoveBox);

    // Reset snap states if no objects are selected or no movement has occurred
    if (conceptsToMoveBox === null || (dragOffset[0] === 0 && dragOffset[1] === 0 && dragOffset[2] === 0)) {
        return {
            ...newState,
            snapCoords: null,
            isDraggingNodesInXYPlane: null,
            isDraggingNodesInXZPlane: null,
            isDraggingNodesInYZPlane: null,
            isDraggingNodesSnappedToXAxis: false,
            isDraggingNodesSnappedToYAxis: false,
            isDraggingNodesSnappedToZAxis: false,
        };
    }

    // Calculate the center point of the bounding box to use as the alignment reference
    const initialAlignPoint = createPoint(
        conceptsToMoveBox.x + (conceptsToMoveBox.width / 2),
        conceptsToMoveBox.y + (conceptsToMoveBox.height / 2),
        conceptsToMoveBox.z + (conceptsToMoveBox.depth / 2));
    const alignPoint = createPoint(
        initialAlignPoint[0] + dragOffset[0],
        initialAlignPoint[1] + dragOffset[1],
        initialAlignPoint[2] + dragOffset[2]);

    // Calculate the nearest 0.5 unit grid intersection
    const snapX = Math.round(alignPoint[0] * 2) / 2;
    const snapY = Math.round(alignPoint[1] * 2) / 2;
    const snapZ = Math.round(alignPoint[2] * 2) / 2;
    const idealSnapCoords = createPoint(snapX, snapY, snapZ);

    // Determine for each axis if the point is close enough to the grid to snap
    const [dragOffsetX, shouldSnapToX] = getNewDragOffsetCoord(0, initialAlignPoint, alignPoint, idealSnapCoords, dragOffset);
    const [dragOffsetY, shouldSnapToY] = getNewDragOffsetCoord(1, initialAlignPoint, alignPoint, idealSnapCoords, dragOffset);
    const [dragOffsetZ, shouldSnapToZ] = getNewDragOffsetCoord(2, initialAlignPoint, alignPoint, idealSnapCoords, dragOffset);

    // Identify if the movement is restricted to a specific 2D plane
    const xyPlane = dragOffset[2] === 0;
    const xzPlane = dragOffset[1] === 0;
    const yzPlane = dragOffset[0] === 0;
    // Identify if the movement is effectively snapped to a 1D axis within those planes
    const isDraggingNodesSnappedToXAxis = (shouldSnapToY || shouldSnapToZ) && (xyPlane || xzPlane);
    const isDraggingNodesSnappedToYAxis = (shouldSnapToX || shouldSnapToZ) && (xyPlane || yzPlane);
    const isDraggingNodesSnappedToZAxis = (shouldSnapToX || shouldSnapToY) && (xzPlane || yzPlane);

    // Create the final coordinate: use the snapped value if within threshold, otherwise use the raw drag position
    const snapCoords = createPoint(
        shouldSnapToX ? snapX : alignPoint[0],
        shouldSnapToY ? snapY : alignPoint[1],
        shouldSnapToZ ? snapZ : alignPoint[2]);

    // If snapping didn't change the offset values, return without overriding dragOffset
    if (dragOffset[0] === dragOffsetX && dragOffset[1] === dragOffsetY && dragOffset[2] === dragOffsetZ) {
        return {
            ...newState,
            snapCoords,
            isDraggingNodesInXYPlane: xyPlane,
            isDraggingNodesInXZPlane: xzPlane,
            isDraggingNodesInYZPlane: yzPlane,
            isDraggingNodesSnappedToXAxis,
            isDraggingNodesSnappedToYAxis,
            isDraggingNodesSnappedToZAxis,
        };
    }

    return {
        ...newState,
        snapCoords,
        dragOffset: createPoint(dragOffsetX, dragOffsetY, dragOffsetZ),
        isDraggingNodesInXYPlane: xyPlane,
        isDraggingNodesInXZPlane: xzPlane,
        isDraggingNodesInYZPlane: yzPlane,
        isDraggingNodesSnappedToXAxis,
        isDraggingNodesSnappedToYAxis,
        isDraggingNodesSnappedToZAxis,
    };
}

/**
 * Calculates whether a specific coordinate index should snap and returns the resulting offset.
 */
function getNewDragOffsetCoord(coordIndex: number, initialAlignPoint: Point, alignPoint: Point, snapCoords: Point, dragOffset: Point) : [number, boolean] {
    const shouldSnapCoord = shouldSnap(alignPoint[coordIndex], snapCoords[coordIndex]);
    const dragOffsetCoord = shouldSnapCoord ?
        snapCoords[coordIndex] - initialAlignPoint[coordIndex] :
        dragOffset[coordIndex];

    return [dragOffsetCoord, shouldSnapCoord];
}

/**
 * Determines if the distance between the current point and the ideal grid snap is within the threshold.
 */
function shouldSnap(alignPointCoord: number, snapCoord: number) {
    const diff = Math.abs(alignPointCoord - snapCoord);
    return diff > 0 && diff < SNAP_THRESHOLD;
}