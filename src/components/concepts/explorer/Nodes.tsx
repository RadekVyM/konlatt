import { useLayoutEffect, useRef } from "react";
import useExplorerStore from "../../../stores/explorer/useExplorerStore";
import { InstancedMesh, Matrix4, Mesh, Object3D } from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import { getNodeColor } from "../../../utils/diagram";
import { themedColor } from "../diagram/utils";
import { PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT } from "../../../constants/canvas-drawing";

const HOVERED_MESH_NAME = "hovered_mesh";

const tempObject = new Object3D();

export default function Nodes() {
    const instancedMeshRef = useRef<InstancedMesh>(null);
    const hoverSphereRef = useRef<Mesh>(null);
    const hoveredIdRef = useRef<number | undefined>(undefined);
    const concepts = useExplorerStore((state) => state.concepts);
    const selectedConceptIndex = useExplorerStore((state) => state.selectedConceptIndex);
    const filteredConceptIndexes = useExplorerStore((state) => state.filteredConceptIndexes);
    const currentTheme = useGlobalsStore((state) => state.currentTheme);
    const invalidate = useThree((state) => state.invalidate);

    useLayoutEffect(() => {
        if (!instancedMeshRef.current || !concepts) {
            return;
        }

        for (let i = 0; i < concepts.length; i++) {
            const concept = concepts[i];
            const color = getNodeColor(concept.conceptIndex, selectedConceptIndex, filteredConceptIndexes, currentTheme);

            instancedMeshRef.current?.setColorAt(i, color);
        }

        if (instancedMeshRef.current.instanceColor) {
            instancedMeshRef.current.instanceColor.needsUpdate = true;
            invalidate();
        }
    }, [concepts, selectedConceptIndex, filteredConceptIndexes, currentTheme]);

    useLayoutEffect(() => {
        if (!instancedMeshRef.current || !concepts) {
            return;
        }

        for (let i = 0; i < concepts.length; i++) {
            const concept = concepts[i];

            tempObject.position.set(concept.position[0], concept.position[1], concept.position[2]);
            tempObject.updateMatrix();

            instancedMeshRef.current.setMatrixAt(i, tempObject.matrix);
        }

        instancedMeshRef.current.instanceMatrix.needsUpdate = true;

        instancedMeshRef.current.computeBoundingSphere();
        instancedMeshRef.current.computeBoundingBox();

        invalidate();
    }, [concepts]);

    useLayoutEffect(() => {
        if (hoverSphereRef.current) {
            hoverSphereRef.current.visible = false;
            invalidate();
        }

        hoveredIdRef.current = undefined;
        useExplorerStore.getState().setHoveredConceptIndex(null);
    }, [selectedConceptIndex]);

    function onClick(e: ThreeEvent<MouseEvent>) {
        e.stopPropagation();

        if (e.eventObject.name === HOVERED_MESH_NAME && hoveredIdRef.current !== undefined) {
            onNodeClick(hoveredIdRef.current);
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

            const explorerStore = useExplorerStore.getState();
            const conceptIndex = explorerStore.layoutToConceptIndexesMapping.get(e.instanceId);

            if (conceptIndex !== undefined) {
                explorerStore.setHoveredConceptIndex(conceptIndex);
            }
        }
        hoveredIdRef.current = e.instanceId;
    }

    function onPointerLeave(e: ThreeEvent<MouseEvent>) {
        if (e.instanceId !== undefined && hoverSphereRef.current) {
            hoverSphereRef.current.visible = false;
            invalidate();
        }
        hoveredIdRef.current = undefined;
        useExplorerStore.getState().setHoveredConceptIndex(null);
    }

    function onNodeClick(instanceId: number) {
        const explorerStore = useExplorerStore.getState();
        const conceptIndex = explorerStore.layoutToConceptIndexesMapping.get(instanceId);

        if (conceptIndex === undefined) {
            return;
        }

        explorerStore.setSelectedConceptIndex(conceptIndex);
    }

    return (
        <>
            <instancedMesh
                key={concepts.length}
                ref={instancedMeshRef}
                args={[undefined, undefined, concepts.length]}
                frustumCulled={false}
                onClick={onClick}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}>
                <sphereGeometry args={[0.1, 8, 8]} />
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
                    color={themedColor(PRIMARY_COLOR_LIGHT, PRIMARY_COLOR_DARK, currentTheme)} />
            </mesh>
        </>
    );
}