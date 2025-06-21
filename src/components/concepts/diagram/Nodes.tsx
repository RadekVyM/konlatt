import { useLayoutEffect, useRef } from "react";
import { Color, InstancedMesh, Matrix4, Mesh } from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { DEFAULT_COLOR_LIGHT, PRIMARY_COLOR_LIGHT } from "./constants";
import useDiagramStore from "../../../stores/useDiagramStore";
import { createRange, setNodesTransformMatrices } from "./utils";

const HOVERED_MESH_NAME = "hovered_mesh";

export default function Nodes() {
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const dragOffset = useDiagramStore((state) => state.dragOffset);
    const selectedConceptIndex = useDiagramStore((state) => state.selectedConceptIndex);
    const conceptsToMoveIndexes = useDiagramStore((state) => state.conceptsToMoveIndexes);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const invalidate = useThree((state) => state.invalidate);
    const instancedMeshRef = useRef<InstancedMesh>(null);
    const hoverSphereRef = useRef<Mesh>(null);
    const hoveredIdRef = useRef<number | undefined>(undefined);
    const prevSelectedConceptIndexRef = useRef<number | null>(null);

    useLayoutEffect(() => {
        if (!layout) {
            return;
        }

        for (let i = 0; i < layout.length; i++) {
            instancedMeshRef.current?.setColorAt(i, DEFAULT_COLOR_LIGHT);
        }
        if (instancedMeshRef.current?.instanceColor) {
            instancedMeshRef.current.instanceColor.needsUpdate = true;
        }
    }, [layout]);

    useLayoutEffect(() => {
        if (!instancedMeshRef.current || !layout || !diagramOffsets) {
            return;
        }

        setNodesTransformMatrices(
            instancedMeshRef.current,
            createRange(layout.length),
            layout,
            diagramOffsets,
            [0, 0, 0],
            cameraType);

        invalidate();
    }, [layout, cameraType, diagramOffsets]);

    useLayoutEffect(() => {
        if (!instancedMeshRef.current || !layout || !diagramOffsets || conceptsToMoveIndexes.size === 0) {
            return;
        }

        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;

        setNodesTransformMatrices(
            instancedMeshRef.current,
            [...conceptsToMoveIndexes].map((conceptIndex) => conceptToLayoutIndexesMapping.get(conceptIndex)!),
            layout,
            diagramOffsets,
            dragOffset,
            cameraType);

        invalidate();
    }, [conceptsToMoveIndexes, dragOffset, layout, cameraType, diagramOffsets]);

    useLayoutEffect(() => {
        if (prevSelectedConceptIndexRef.current !== null) {
            setConceptNodeColor(prevSelectedConceptIndexRef.current, DEFAULT_COLOR_LIGHT);
        }
        if (selectedConceptIndex !== null) {
            setConceptNodeColor(selectedConceptIndex, PRIMARY_COLOR_LIGHT);
        }
        prevSelectedConceptIndexRef.current = selectedConceptIndex;
        invalidate();
    }, [selectedConceptIndex]);

    function onClick(e: ThreeEvent<MouseEvent>) {
        if (e.eventObject.name === HOVERED_MESH_NAME && hoveredIdRef.current !== undefined) {
            onNodeClick(hoveredIdRef.current);
            e.stopPropagation();
            return;
        }

        if (e.instanceId !== undefined) {
            onNodeClick(e.instanceId);
        }
    }

    function onPointerMove(e: ThreeEvent<MouseEvent>) {
        if (e.instanceId !== undefined && hoveredIdRef.current !== e.instanceId && hoverSphereRef.current) {
            const matrix = new Matrix4();
            instancedMeshRef.current?.getMatrixAt(e.instanceId, matrix);
            hoverSphereRef.current.position.setFromMatrixPosition(matrix);
            hoverSphereRef.current.visible = true;
            invalidate();
        }
        hoveredIdRef.current = e.instanceId;
    }

    function onPointerLeave(e: ThreeEvent<MouseEvent>) {
        if (e.instanceId !== undefined && hoverSphereRef.current) {
            hoverSphereRef.current.visible = false;
            invalidate();
        }
        hoveredIdRef.current = undefined;
    }

    function onNodeClick(instanceId: number) {
        const diagramStore = useDiagramStore.getState();
        const conceptIndex = diagramStore.layoutToConceptIndexesMapping.get(instanceId);

        if (conceptIndex === undefined) {
            return;
        }

        if (diagramStore.editingEnabled) {
            diagramStore.setConceptsToMoveIndexes((old) => {
                const newSet = new Set<number>(old);
                if (newSet.has(conceptIndex)) {
                    newSet.delete(conceptIndex);
                }
                else {
                    newSet.add(conceptIndex);
                }
                return newSet;
            });
        }
        else {
            diagramStore.setSelectedConceptIndex(conceptIndex);
        }
    }

    function setConceptNodeColor(conceptIndex: number, color: Color) {
        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;
        const instanceId = conceptToLayoutIndexesMapping.get(conceptIndex);

        if (instanceId === undefined) {
            return;
        }

        instancedMeshRef.current?.setColorAt(instanceId, color);
        if (instancedMeshRef.current?.instanceColor) {
            instancedMeshRef.current.instanceColor.needsUpdate = true;
        }
    }

    // When I change number of instances, onClick stops working
    // Only thing that fixes that is adding a key to the Nodes element
    // https://github.com/pmndrs/react-three-fiber/issues/1937
    // https://github.com/pmndrs/react-three-fiber/issues/3289

    return (
        <>
            <instancedMesh
                ref={instancedMeshRef}
                args={[undefined, undefined, layout?.length || 0]}
                frustumCulled={false}
                onClick={onClick}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}>
                <sphereGeometry args={[0.1, 8, 8]}/>
                <meshBasicMaterial />
            </instancedMesh>

            <mesh
                ref={hoverSphereRef}
                name={HOVERED_MESH_NAME}
                visible={false}
                onClick={onClick}>
                <sphereGeometry args={[0.195, 10, 10]}/>
                <meshBasicMaterial
                    opacity={0.3}
                    transparent
                    color={PRIMARY_COLOR_LIGHT} />
            </mesh>
        </>
    );
}