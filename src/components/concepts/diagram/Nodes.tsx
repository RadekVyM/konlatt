import { useLayoutEffect, useRef } from "react";
import { InstancedMesh, Matrix4, Mesh } from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { DIM_NODE_COLOR_DARK, DIM_NODE_COLOR_LIGHT, NODE_COLOR_DARK, NODE_COLOR_LIGHT, PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT } from "../../../constants/diagram";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { setNodesTransformMatrices, themedColor } from "./utils";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import { Point } from "../../../types/Point";
import { CameraType } from "../../../types/CameraType";
import { isRightClick } from "../../../utils/html";
import { createRange } from "../../../utils/array";

const HOVERED_MESH_NAME = "hovered_mesh";

export default function Nodes() {
    const instancedMeshRef = useRef<InstancedMesh>(null);
    const hoverSphereRef = useRef<Mesh>(null);
    const hoveredIdRef = useRef<number | undefined>(undefined);
    const currentTheme = useGlobalsStore((state) => state.currentTheme);
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const dragOffset = useDiagramStore((state) => state.dragOffset);
    const selectedConceptIndex = useDiagramStore((state) => state.selectedConceptIndex);
    const conceptsToMoveIndexes = useDiagramStore((state) => state.conceptsToMoveIndexes);
    const visibleConceptIndexes = useDiagramStore((state) => state.visibleConceptIndexes);
    const filteredConceptIndexes = useDiagramStore((state) => state.filteredConceptIndexes);
    const displayHighlightedSublatticeOnly = useDiagramStore((state) => state.displayHighlightedSublatticeOnly);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const invalidate = useThree((state) => state.invalidate);

    useLayoutEffect(() => {
        const layoutToConceptIndexesMapping = useDiagramStore.getState().layoutToConceptIndexesMapping;

        if (!layout) {
            return;
        }

        for (let layoutIndex = 0; layoutIndex < layout.length; layoutIndex++) {
            const conceptIndex = layoutToConceptIndexesMapping.get(layoutIndex);
            const isSelected = conceptIndex === selectedConceptIndex;
            const isFilteredOut = conceptIndex !== undefined && filteredConceptIndexes && !filteredConceptIndexes.has(conceptIndex);

            const color = isSelected ?
                themedColor(PRIMARY_COLOR_LIGHT, PRIMARY_COLOR_DARK, currentTheme) :
                isFilteredOut ?
                    themedColor(DIM_NODE_COLOR_LIGHT, DIM_NODE_COLOR_DARK, currentTheme) :
                    themedColor(NODE_COLOR_LIGHT, NODE_COLOR_DARK, currentTheme);

            instancedMeshRef.current?.setColorAt(layoutIndex, color);
        }
        if (instancedMeshRef.current?.instanceColor) {
            instancedMeshRef.current.instanceColor.needsUpdate = true;
            invalidate();
        }
    }, [layout, selectedConceptIndex, filteredConceptIndexes, currentTheme]);

    useLayoutEffect(() => {
        if (!instancedMeshRef.current || !layout || !diagramOffsets) {
            return;
        }

        const layoutIndexes = createRange(layout.length);

        setNodesTransformMatricesHelper(
            instancedMeshRef.current,
            layoutIndexes,
            visibleConceptIndexes,
            displayHighlightedSublatticeOnly,
            layout,
            diagramOffsets,
            [0, 0, 0],
            cameraType);

        invalidate();
    }, [layout, cameraType, diagramOffsets, visibleConceptIndexes, displayHighlightedSublatticeOnly]);

    useLayoutEffect(() => {
        if (!instancedMeshRef.current || !layout || !diagramOffsets || conceptsToMoveIndexes.size === 0) {
            return;
        }

        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;
        // Be careful here...
        const layoutIndexes = [...conceptsToMoveIndexes].map((conceptIndex) => conceptToLayoutIndexesMapping.get(conceptIndex)!);

        setNodesTransformMatricesHelper(
            instancedMeshRef.current,
            layoutIndexes,
            visibleConceptIndexes,
            displayHighlightedSublatticeOnly,
            layout,
            diagramOffsets,
            dragOffset,
            cameraType);

        invalidate();
    }, [conceptsToMoveIndexes, dragOffset, layout, cameraType, diagramOffsets, visibleConceptIndexes, displayHighlightedSublatticeOnly]);

    function onClick(e: ThreeEvent<MouseEvent>) {
        if (isRightClick(e)) {
            // This check is probably not needed
            return;
        }

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

            const diagramStore = useDiagramStore.getState();
            const conceptIndex = diagramStore.layoutToConceptIndexesMapping.get(e.instanceId);

            if (conceptIndex !== undefined) {
                diagramStore.setHoveredConceptIndex(conceptIndex);
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
        useDiagramStore.getState().setHoveredConceptIndex(null);
    }

    function onNodeClick(instanceId: number) {
        const diagramStore = useDiagramStore.getState();
        const conceptIndex = diagramStore.layoutToConceptIndexesMapping.get(instanceId);

        if (conceptIndex === undefined) {
            return;
        }

        if (diagramStore.editingEnabled) {
            const multiselectEnabled = diagramStore.multiselectEnabled;

            diagramStore.setConceptsToMoveIndexes((old) => {
                if (!multiselectEnabled) {
                    return new Set<number>([conceptIndex]);
                }

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
                onPointerLeave={onPointerLeave}
                renderOrder={200}>
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
                    color={themedColor(PRIMARY_COLOR_LIGHT, PRIMARY_COLOR_DARK, currentTheme)} />
            </mesh>
        </>
    );
}

function setNodesTransformMatricesHelper(
    instancedMesh: InstancedMesh,
    layoutIndexes: Array<number>,
    visibleConceptIndexes: Set<number> | null,
    displayHighlightedSublatticeOnly: boolean,
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    dragOffset: Point,
    cameraType: CameraType,
) {
    const { highlightedLayoutIndexes, dimLayoutIndexes } = separateNodes(layoutIndexes, visibleConceptIndexes, displayHighlightedSublatticeOnly)

    setNodesTransformMatrices(
        instancedMesh,
        highlightedLayoutIndexes,
        layout,
        diagramOffsets,
        dragOffset,
        cameraType,
        1);
    setNodesTransformMatrices(
        instancedMesh,
        dimLayoutIndexes,
        layout,
        diagramOffsets,
        dragOffset,
        cameraType,
        0.5);
}

function separateNodes(
    layoutIndexes: Array<number>,
    visibleConceptIndexes: Set<number> | null,
    displayHighlightedSublatticeOnly: boolean,
) {
    const highlightedLayoutIndexes = new Array<number>();
    const dimLayoutIndexes = new Array<number>();
    const layoutToConceptIndexesMapping = useDiagramStore.getState().layoutToConceptIndexesMapping;

    for (const layoutIndex of layoutIndexes) {
        // Be careful here...
        const conceptIndex = layoutToConceptIndexesMapping.get(layoutIndex)!;

        if (displayHighlightedSublatticeOnly || visibleConceptIndexes === null || visibleConceptIndexes?.has(conceptIndex)) {
            highlightedLayoutIndexes.push(layoutIndex);
        }
        else {
            dimLayoutIndexes.push(layoutIndex);
        }
    }

    return {
        highlightedLayoutIndexes,
        dimLayoutIndexes,
    };
}