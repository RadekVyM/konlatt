import { useLayoutEffect, useMemo, useRef } from "react";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { Line, Grid as DreiGrid } from "@react-three/drei";
import { createPoint, Point } from "../../../types/Point";
import { GRID_COLOR_DARK, GRID_COLOR_LIGHT, PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT } from "../../../constants/canvas-drawing";
import { themedColor } from "./utils";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import { DoubleSide, Euler, Mesh } from "three";
import { useThree } from "@react-three/fiber";

type AxisLine = [Point, Point]

const OPACITY = 0.5;
const LINE_WIDTH = 2;

export default function Grid() {
    const gridRef = useRef<Mesh>(null);
    const currentTheme = useGlobalsStore((state) => state.currentTheme);
    const snapCoords = useDiagramStore((state) => state.snapCoords);
    const isDraggingNodesSnappedToXAxis = useDiagramStore((state) => state.isDraggingNodesSnappedToXAxis);
    const isDraggingNodesSnappedToYAxis = useDiagramStore((state) => state.isDraggingNodesSnappedToYAxis);
    const isDraggingNodesSnappedToZAxis = useDiagramStore((state) => state.isDraggingNodesSnappedToZAxis);
    const isDraggingNodesInXYPlane = useDiagramStore((state) => state.isDraggingNodesInXYPlane);
    const isDraggingNodesInXZPlane = useDiagramStore((state) => state.isDraggingNodesInXZPlane);
    const isDraggingNodesInYZPlane = useDiagramStore((state) => state.isDraggingNodesInYZPlane);
    const conceptsToMoveBox = useDiagramStore((state) => state.conceptsToMoveBox);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const gridWhileEditingEnabled = useDiagramStore((state) => state.gridWhileEditingEnabled);
    const editingEnabled = useDiagramStore((state) => state.editingEnabled);

    const invalidate = useThree((state) => state.invalidate);

    const isGridVisible = editingEnabled && gridWhileEditingEnabled && (cameraType === "2d" || !!(isDraggingNodesInXYPlane || isDraggingNodesInXZPlane || isDraggingNodesInYZPlane));

    const color = themedColor(PRIMARY_COLOR_LIGHT, PRIMARY_COLOR_DARK, currentTheme);

    const { xAxis, yAxis, zAxis } = useMemo(() => {
        const maxDistance = 100000;

        const xAxis: AxisLine | null = snapCoords === null ?
            null :
            [
                createPoint(-maxDistance, snapCoords[1], snapCoords[2]),
                createPoint(maxDistance, snapCoords[1], snapCoords[2]),
            ];
        const yAxis: AxisLine | null = snapCoords === null ?
            null :
            [
                createPoint(snapCoords[0], -maxDistance, snapCoords[2]),
                createPoint(snapCoords[0], maxDistance, snapCoords[2]),
            ];
        const zAxis: AxisLine | null = snapCoords === null ?
            null :
            [
                createPoint(snapCoords[0], snapCoords[1], -maxDistance),
                createPoint(snapCoords[0], snapCoords[1], maxDistance),
            ];

        return {
            xAxis,
            yAxis,
            zAxis,
        };
    }, [snapCoords?.[0], snapCoords?.[1], snapCoords?.[2]]);

    useLayoutEffect(() => {
        if (!gridRef.current) {
            return;
        }

        gridRef.current.setRotationFromEuler(new Euler(
            cameraType === "2d" || isDraggingNodesInXYPlane ? Math.PI / 2 : 0,
            0,
            cameraType !== "2d" && isDraggingNodesInYZPlane ? Math.PI / 2 : 0));

        if (!conceptsToMoveBox) {
            gridRef.current.position.set(0, 0, 0);
            invalidate();
            return;
        }

        const x = conceptsToMoveBox.x + (conceptsToMoveBox.width / 2);
        const y = conceptsToMoveBox.y + (conceptsToMoveBox.height / 2);
        const z = conceptsToMoveBox.z + (conceptsToMoveBox.depth / 2);

        gridRef.current.position.set(
            cameraType !== "2d" && isDraggingNodesInYZPlane ? x : 0,
            cameraType !== "2d" && isDraggingNodesInXZPlane ? y : 0,
            cameraType !== "2d" && isDraggingNodesInXYPlane ? z : 0);

        invalidate();
    }, [isDraggingNodesInXYPlane, isDraggingNodesInXZPlane, isDraggingNodesInYZPlane, cameraType, conceptsToMoveBox, isGridVisible]);

    return (
        <>
            <DreiGrid
                ref={gridRef}
                visible={isGridVisible}
                side={DoubleSide}
                infiniteGrid
                followCamera
                fadeDistance={10000}
                cellSize={1}
                cellThickness={1.5}
                cellColor={themedColor(GRID_COLOR_LIGHT, GRID_COLOR_DARK, currentTheme)}
                sectionThickness={0} />

            {isDraggingNodesSnappedToXAxis && xAxis &&
                <Line
                    points={xAxis}
                    color={color}
                    opacity={OPACITY}
                    lineWidth={LINE_WIDTH}
                    transparent
                    segments />}
            {isDraggingNodesSnappedToYAxis && yAxis &&
                <Line
                    points={yAxis}
                    color={color}
                    opacity={OPACITY}
                    lineWidth={LINE_WIDTH}
                    transparent
                    segments />}
            {isDraggingNodesSnappedToZAxis && zAxis &&
                <Line
                    points={zAxis}
                    color={color}
                    opacity={OPACITY}
                    lineWidth={LINE_WIDTH}
                    transparent
                    segments />}
        </>
    );
}