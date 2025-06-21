import { PivotControls } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Group, InstancedMesh, Matrix4, Object3D } from "three";
import { getPoint, transformedPoint } from "./utils";
import useDiagramStore from "../../../stores/useDiagramStore";
import { createPoint, Point } from "../../../types/Point";
import { PRIMARY_COLOR_LIGHT } from "./constants";
import { useDiagramOffsets } from "../../../hooks/useDiagramOffsets";

export default function NodesToMove() {
    const instancedMeshRef = useRef<InstancedMesh>(null);
    const pivotControlsRef = useRef<Group>(null);
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const dragOffset = useDiagramStore((state) => state.dragOffset);
    const conceptsToMoveIndexes = useDiagramStore((state) => state.conceptsToMoveIndexes);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const setIsDraggingNodes = useDiagramStore((state) => state.setIsDraggingNodes);
    const setDragOffset = useDiagramStore((state) => state.setDragOffset);

    const { updateNodeOffsets } = useDiagramOffsets();

    const activeAxes: [boolean, boolean, boolean] | undefined = cameraType === "2d" ? [true, true, false] : undefined;

    const points = useMemo(() => {
        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;
        const newPoints = new Array<Point>();

        if (!layout || !diagramOffsets || conceptToLayoutIndexesMapping.size !== layout.length) {
            return newPoints;
        }

        for (const conceptIndex of conceptsToMoveIndexes) {
            const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex);

            if (layoutIndex === undefined || layoutIndex >= layout.length) {
                continue;
            }

            const layoutPoint = layout[layoutIndex];

            newPoints.push(transformedPoint(
                createPoint(layoutPoint.x, layoutPoint.y, layoutPoint.z),
                getPoint(diagramOffsets, conceptIndex),
                dragOffset,
                cameraType));
        }

        return newPoints;
    }, [conceptsToMoveIndexes, layout, cameraType, diagramOffsets, dragOffset]);

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

        for (const point of points) {
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
    }, [conceptsToMoveIndexes, layout, cameraType, diagramOffsets]);

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

    function onDragStart() {
        setIsDraggingNodes(true);
    }

    function onDrag(_: Matrix4, delta: Matrix4) {
        setDragOffset([delta.elements[12], delta.elements[13], delta.elements[14]]);
    }

    function onDragEnd() {
        const distance = Math.sqrt(Math.pow(dragOffset[0], 2) + Math.pow(dragOffset[1], 2) + Math.pow(dragOffset[2], 2));

        if (distance > 0.001) {
            updateNodeOffsets(conceptsToMoveIndexes, dragOffset);
        }

        setDragOffset([0, 0, 0]);
        setIsDraggingNodes(false);
    }

    return (
        <>
            <PivotControls
                ref={pivotControlsRef}
                enabled={conceptsToMoveIndexes.size > 0}
                disableRotations
                disableScaling
                activeAxes={activeAxes}
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragEnd={onDragEnd}>
            </PivotControls>

            <instancedMesh
                ref={instancedMeshRef}
                args={[undefined, undefined, conceptsToMoveIndexes.size]}
                frustumCulled={false}>
                <sphereGeometry args={[0.2, 10, 10]}/>
                <meshBasicMaterial
                    opacity={0.3}
                    transparent
                    color={PRIMARY_COLOR_LIGHT} />
            </instancedMesh>
        </>
    );
}