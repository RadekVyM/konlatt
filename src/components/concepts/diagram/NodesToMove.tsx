import { PivotControls } from "@react-three/drei";
import { RefObject, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Group, InstancedMesh, Matrix4, Object3D } from "three";
import { getPoint, themedColor } from "./utils";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { createPoint, Point } from "../../../types/Point";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import { transformedPoint } from "../../../utils/layout";
import { PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT } from "../../../constants/canvas-drawing";
import useEventListener from "../../../hooks/useEventListener";

/**
 * Component that renders a set of selectable nodes with interactive pivot controls 
 * for translation within a 3D or 2D diagram.
*/
export default function NodesToMove() {
    const instancedMeshRef = useRef<InstancedMesh>(null);
    const currentTheme = useGlobalsStore((state) => state.currentTheme);

    const points = usePoints();
    useNodesTransformation(instancedMeshRef, points);

    return (
        <>
            <PivotControlsInternal
                points={points} />

            <instancedMesh
                ref={instancedMeshRef}
                args={[undefined, undefined, points.length]}
                frustumCulled={false}>
                <sphereGeometry args={[0.2, 10, 10]}/>
                <meshBasicMaterial
                    opacity={0.3}
                    transparent
                    color={themedColor(PRIMARY_COLOR_LIGHT, PRIMARY_COLOR_DARK, currentTheme)} />
            </instancedMesh>
        </>
    );
}

function PivotControlsInternal(props: {
    points: ReadonlyArray<Point>,
}) {
    const pivotControlsRef = useRef<Group>(null);
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const conceptsToMoveIndexes = useDiagramStore((state) => state.conceptsToMoveIndexes);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);
    const isDraggingNodes = useDiagramStore((state) => state.isDraggingNodes);
    const setIsDraggingNodes = useDiagramStore((state) => state.setIsDraggingNodes);
    const setDragOffset = useDiagramStore((state) => state.setDragOffset);
    const applyDragOffset = useDiagramStore((state) => state.applyDragOffset);

    const activeAxes: [boolean, boolean, boolean] | undefined = cameraType === "2d" ? [true, true, false] : undefined;

    const { pivotResetKey } = useDragStateReset();

    useLayoutEffect(() => {
        if (!pivotControlsRef.current || conceptsToMoveIndexes.size === 0) {
            return;
        }

        let minX = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;
        let minZ = Number.MAX_SAFE_INTEGER;
        let maxZ = Number.MIN_SAFE_INTEGER;

        for (const point of props.points) {
            minX = Math.min(minX, point[0]);
            maxX = Math.max(maxX, point[0]);
            minY = Math.min(minY, point[1]);
            maxY = Math.max(maxY, point[1]);
            minZ = Math.min(minZ, point[2]);
            maxZ = Math.max(maxZ, point[2]);
        }

        pivotControlsRef.current.position.set(
            (maxX + minX) / 2,
            (maxY + minY) / 2,
            (maxZ + minZ) / 2);
        pivotControlsRef.current.updateMatrix();
        // This dependency array needs to be like this
        // This effect cannot be run on dragOffset changes
    }, [conceptsToMoveIndexes, layout, cameraType, diagramOffsets, isDraggingNodes, horizontalScale, verticalScale, rotationDegrees]);

    function onDragStart() {
        setIsDraggingNodes(true);
    }

    function onDrag(_: Matrix4, delta: Matrix4) {
        setDragOffset([delta.elements[12], delta.elements[13], delta.elements[14]]);
    }

    function onDragEnd() {
        applyDragOffset();
    }

    return (
        <PivotControls
            key={pivotResetKey}
            ref={pivotControlsRef}
            enabled={conceptsToMoveIndexes.size > 0}
            disableRotations
            disableScaling
            depthTest={false}
            activeAxes={activeAxes}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={onDragEnd} />
    );
}

function useNodesTransformation(
    instancedMeshRef: RefObject<InstancedMesh | null>,
    points: ReadonlyArray<Point>,
) {
    useLayoutEffect(() => {
        if (!instancedMeshRef.current) {
            return;
        }

        const temp = new Object3D();
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];

            temp.position.set(...point);
            temp.updateMatrix();

            instancedMeshRef.current.setMatrixAt(i, temp.matrix);
        }

        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [points]);
}

function usePoints() {
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const dragOffset = useDiagramStore((state) => state.dragOffset);
    const conceptsToMoveIndexes = useDiagramStore((state) => state.conceptsToMoveIndexes);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);

    return useMemo(() => {
        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;
        const newPoints = new Array<Point>();

        if (!layout || !diagramOffsets || conceptToLayoutIndexesMapping.size !== layout.length) {
            return newPoints;
        }

        for (const conceptIndex of conceptsToMoveIndexes) {
            const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex);

            if (layoutIndex === undefined || layoutIndex >= layout.length) {
                console.error(`Layout index should not be ${layoutIndex}`);
                continue;
            }

            const layoutPoint = layout[layoutIndex];

            newPoints.push(transformedPoint(
                createPoint(layoutPoint.x, layoutPoint.y, layoutPoint.z),
                getPoint(diagramOffsets, layoutIndex),
                dragOffset,
                horizontalScale,
                verticalScale,
                rotationDegrees,
                cameraType,));
        }

        return newPoints;
    }, [conceptsToMoveIndexes, layout, cameraType, diagramOffsets, dragOffset, horizontalScale, verticalScale, rotationDegrees]);
}

function useDragStateReset() {
    const [pivotResetKey, setPivotResetKey] = useState(0);

    // For example, when I am dragging some nodes (`isDraggingNodes` is true) and switch browser tabs
    // using ctrl+tab, `isDraggingNodes` stays stuck on true and is not reset back to false.
    // This is more of a workaround than a proper fix
    useEventListener("pointerup", handler);
    useEventListener("pointercancel", handler);
    useEventListener("blur", handler);

    function handler() {
        if (useDiagramStore.getState().isDraggingNodes) {
            useDiagramStore.getState().applyDragOffset();
            setPivotResetKey(Math.random());
        }
    }

    return {
        pivotResetKey
    };
}