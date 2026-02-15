import { useLayoutEffect, useMemo, useRef } from "react";
import { DoubleSide, InstancedMesh, LatheGeometry, Matrix4, Mesh, Object3D, Vector2 } from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT } from "../../../constants/diagram";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { setNodesTransformMatrices, setupNodeTransform, themedColor } from "./utils";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import { Point } from "../../../types/Point";
import { CameraType } from "../../../types/CameraType";
import { isRightClick } from "../../../utils/html";
import { createRange } from "../../../utils/array";
import { getNodeColor } from "../../../utils/diagram";

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
    const sublatticeConceptIndexes = useDiagramStore((state) => state.sublatticeConceptIndexes);
    const lowerConeOnlyConceptIndex = useDiagramStore((state) => state.lowerConeOnlyConceptIndex);
    const upperConeOnlyConceptIndex = useDiagramStore((state) => state.upperConeOnlyConceptIndex);
    const filteredConceptIndexes = useDiagramStore((state) => state.filteredConceptIndexes);
    const displayHighlightedSublatticeOnly = useDiagramStore((state) => state.displayHighlightedSublatticeOnly);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);
    const invalidate = useThree((state) => state.invalidate);

    useLayoutEffect(() => {
        const layoutToConceptIndexesMapping = useDiagramStore.getState().layoutToConceptIndexesMapping;

        if (!layout) {
            return;
        }

        for (let layoutIndex = 0; layoutIndex < layout.length; layoutIndex++) {
            const conceptIndex = layoutToConceptIndexesMapping.get(layoutIndex);
            const color = getNodeColor(
                conceptIndex,
                selectedConceptIndex,
                filteredConceptIndexes,
                currentTheme);

            instancedMeshRef.current?.setColorAt(layoutIndex, color);
        }
        if (instancedMeshRef.current?.instanceColor) {
            instancedMeshRef.current.instanceColor.needsUpdate = true;
            invalidate();
        }
    }, [layout, selectedConceptIndex, filteredConceptIndexes, lowerConeOnlyConceptIndex, upperConeOnlyConceptIndex, currentTheme]);

    useLayoutEffect(() => {
        if (!instancedMeshRef.current || !layout || !diagramOffsets) {
            return;
        }

        const layoutIndexes = createRange(layout.length);

        setNodesTransformMatricesHelper(
            instancedMeshRef.current,
            layoutIndexes,
            sublatticeConceptIndexes,
            lowerConeOnlyConceptIndex,
            upperConeOnlyConceptIndex,
            displayHighlightedSublatticeOnly,
            layout,
            diagramOffsets,
            [0, 0, 0],
            cameraType,
            horizontalScale,
            verticalScale,
            rotationDegrees);

        invalidate();
    }, [
        layout,
        cameraType,
        diagramOffsets,
        sublatticeConceptIndexes,
        lowerConeOnlyConceptIndex,
        upperConeOnlyConceptIndex,
        displayHighlightedSublatticeOnly,
        horizontalScale,
        verticalScale,
        rotationDegrees,
    ]);

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
            sublatticeConceptIndexes,
            lowerConeOnlyConceptIndex,
            upperConeOnlyConceptIndex,
            displayHighlightedSublatticeOnly,
            layout,
            diagramOffsets,
            dragOffset,
            cameraType,
            horizontalScale,
            verticalScale,
            rotationDegrees);

        invalidate();
    }, [
        conceptsToMoveIndexes,
        dragOffset,
        layout,
        cameraType,
        diagramOffsets,
        sublatticeConceptIndexes,
        lowerConeOnlyConceptIndex,
        upperConeOnlyConceptIndex,
        displayHighlightedSublatticeOnly,
        horizontalScale,
        verticalScale,
        rotationDegrees,
    ]);

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

            <ConeHemispheres />
        </>
    );
}

function ConeHemispheres() {
    const radius = 0.1;
    const widthSegments = 10;
    const lowerSphereRef = useRef<Mesh>(null);
    const upperSphereRef = useRef<Mesh>(null);
    const geometry = useHemisphereGeometry(radius, widthSegments, 5);
    const currentTheme = useGlobalsStore((state) => state.currentTheme);
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const dragOffset = useDiagramStore((state) => state.dragOffset);
    const conceptsToMoveIndexes = useDiagramStore((state) => state.conceptsToMoveIndexes);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const selectedConceptIndex = useDiagramStore((state) => state.selectedConceptIndex);
    const filteredConceptIndexes = useDiagramStore((state) => state.filteredConceptIndexes);
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);
    const lowerConeOnlyConceptIndex = useDiagramStore((state) => state.lowerConeOnlyConceptIndex);
    const upperConeOnlyConceptIndex = useDiagramStore((state) => state.upperConeOnlyConceptIndex);
    const invalidate = useThree((state) => state.invalidate);

    const lowerColor = getNodeColor(lowerConeOnlyConceptIndex, selectedConceptIndex, filteredConceptIndexes, currentTheme);
    const upperColor = getNodeColor(upperConeOnlyConceptIndex, selectedConceptIndex, filteredConceptIndexes, currentTheme);

    useLayoutEffect(() => {
        if (!lowerSphereRef.current || !upperSphereRef.current || !layout || !diagramOffsets) {
            return;
        }

        lowerSphereRef.current.visible = lowerConeOnlyConceptIndex !== null;
        upperSphereRef.current.visible = upperConeOnlyConceptIndex !== null;

        if (!lowerSphereRef.current.visible && !upperSphereRef.current.visible) {
            return;
        }

        const temp = new Object3D();

        transformHemisphere(
            lowerSphereRef,
            lowerConeOnlyConceptIndex,
            layout,
            temp,
            diagramOffsets,
            dragOffset,
            conceptsToMoveIndexes,
            cameraType,
            horizontalScale,
            verticalScale,
            rotationDegrees);

        transformHemisphere(
            upperSphereRef,
            upperConeOnlyConceptIndex,
            layout,
            temp,
            diagramOffsets,
            dragOffset,
            conceptsToMoveIndexes,
            cameraType,
            horizontalScale,
            verticalScale,
            rotationDegrees);

        invalidate();
    }, [
        layout,
        diagramOffsets,
        dragOffset,
        conceptsToMoveIndexes,
        cameraType,
        horizontalScale,
        verticalScale,
        rotationDegrees,
        lowerConeOnlyConceptIndex,
        upperConeOnlyConceptIndex,
    ]);

    return (
        <>
            <mesh
                ref={lowerSphereRef}
                visible={false}
                geometry={geometry}
                rotation-x={Math.PI}>
                <meshBasicMaterial
                    color={lowerColor}
                    side={DoubleSide} />
            </mesh>
            <mesh
                ref={upperSphereRef}
                visible={false}
                geometry={geometry}>
                <meshBasicMaterial
                    color={upperColor}
                    side={DoubleSide} />
            </mesh>
        </>
    );
}

function useHemisphereGeometry(radius: number, widthSegments: number, heightSegments: number) {
    return useMemo(() => {
        const roundingRadius = radius * 0.2;
        const roundingHeight = roundingRadius * 0.5;
        const points = new Array<Vector2>();

        for (let i = 0; i <= heightSegments; i++) {
            // Angle goes from 90 degrees (top) down to 0 degrees (side)
            const angle = (Math.PI / 2) * (1 - i / heightSegments); 

            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            // Ignore points below the rounding height
            if (y > roundingHeight) {
                points.push(new Vector2(x, y));
            }
        }

        const roundingSegmentsCount = 3;
        const roundingCenterX = radius - roundingRadius;

        for (let i = 0; i <= roundingSegmentsCount; i++) {
            const angle = (Math.PI / 2) * (i / roundingSegmentsCount); 

            const x = roundingCenterX + roundingRadius * Math.cos(angle);
            const y = roundingHeight - roundingRadius * Math.sin(angle); 

            if (x <= radius) {
                points.push(new Vector2(x, y));
            }
        }

        points.push(new Vector2(0, roundingHeight - roundingRadius)); 

        return new LatheGeometry(points, widthSegments);
    }, [radius, widthSegments]);
}

function transformHemisphere(
    sphereRef: React.RefObject<Mesh | null>,
    conceptIndex: number | null,
    layout: ConceptLatticeLayout,
    temp: Object3D,
    diagramOffsets: Array<Point>,
    dragOffset: Point,
    conceptsToMoveIndexes: Set<number>,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
) {
    if (conceptIndex === null || !sphereRef.current) {
        return;
    }

    const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;
    // Be careful here...
    const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex)!;

    if (layoutIndex < layout.length) {
        setupNodeTransform(
            temp,
            layout,
            layoutIndex,
            diagramOffsets,
            conceptsToMoveIndexes.size !== 0 && conceptsToMoveIndexes.has(conceptIndex) ?
                dragOffset :
                [0, 0, 0],
            1,
            cameraType,
            horizontalScale,
            verticalScale,
            rotationDegrees);

        sphereRef.current.position.setFromMatrixPosition(temp.matrix);
        sphereRef.current.visible = true;
    }
}

function setNodesTransformMatricesHelper(
    instancedMesh: InstancedMesh,
    layoutIndexes: Array<number>,
    sublatticeConceptIndexes: Set<number> | null,
    lowerConeOnlyConceptIndex: number | null,
    upperConeOnlyConceptIndex: number | null,
    displayHighlightedSublatticeOnly: boolean,
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    dragOffset: Point,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
) {
    const { highlightedLayoutIndexes, dimLayoutIndexes, coneLayoutIndexes } = separateNodes(
        layoutIndexes,
        sublatticeConceptIndexes,
        lowerConeOnlyConceptIndex,
        upperConeOnlyConceptIndex,
        displayHighlightedSublatticeOnly);

    setNodesTransformMatrices(
        instancedMesh,
        highlightedLayoutIndexes,
        layout,
        diagramOffsets,
        dragOffset,
        cameraType,
        horizontalScale,
        verticalScale,
        rotationDegrees,
        1);
    setNodesTransformMatrices(
        instancedMesh,
        dimLayoutIndexes,
        layout,
        diagramOffsets,
        dragOffset,
        cameraType,
        horizontalScale,
        verticalScale,
        rotationDegrees,
        0.5);
    setNodesTransformMatrices(
        instancedMesh,
        coneLayoutIndexes,
        layout,
        diagramOffsets,
        dragOffset,
        cameraType,
        horizontalScale,
        verticalScale,
        rotationDegrees,
        0.68);
}

function separateNodes(
    layoutIndexes: Array<number>,
    sublatticeConceptIndexes: Set<number> | null,
    lowerConeOnlyConceptIndex: number | null,
    upperConeOnlyConceptIndex: number | null,
    displayHighlightedSublatticeOnly: boolean,
) {
    const highlightedLayoutIndexes = new Array<number>();
    const dimLayoutIndexes = new Array<number>();
    const coneLayoutIndexes = new Array<number>();
    const layoutToConceptIndexesMapping = useDiagramStore.getState().layoutToConceptIndexesMapping;

    for (const layoutIndex of layoutIndexes) {
        // Be careful here...
        const conceptIndex = layoutToConceptIndexesMapping.get(layoutIndex)!;

        if (conceptIndex === lowerConeOnlyConceptIndex || conceptIndex === upperConeOnlyConceptIndex) {
            coneLayoutIndexes.push(layoutIndex);
            continue;
        }

        if (displayHighlightedSublatticeOnly || sublatticeConceptIndexes === null || sublatticeConceptIndexes?.has(conceptIndex)) {
            highlightedLayoutIndexes.push(layoutIndex);
        }
        else {
            dimLayoutIndexes.push(layoutIndex);
        }
    }

    return {
        highlightedLayoutIndexes,
        dimLayoutIndexes,
        coneLayoutIndexes,
    };
}