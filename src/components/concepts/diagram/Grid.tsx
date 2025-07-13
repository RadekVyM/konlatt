import { useMemo } from "react";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { Line } from "@react-three/drei";
import { createPoint, Point } from "../../../types/Point";
import { PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT } from "../../../constants/diagram";
import { themedColor } from "./utils";
import useGlobalsStore from "../../../stores/useGlobalsStore";

type AxisLine = [Point, Point]

const OPACITY = 0.5;
const LINE_WIDTH = 1;

export default function Grid() {
    const snapCoords = useDiagramStore((state) => state.snapCoords);
    const currentTheme = useGlobalsStore((state) => state.currentTheme);
    const isDraggingNodesSnappedToXAxis = useDiagramStore((state) => state.isDraggingNodesSnappedToXAxis);
    const isDraggingNodesSnappedToYAxis = useDiagramStore((state) => state.isDraggingNodesSnappedToYAxis);
    const isDraggingNodesSnappedToZAxis = useDiagramStore((state) => state.isDraggingNodesSnappedToZAxis);

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

    return (
        <>
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