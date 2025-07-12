import { DoubleSide, FrontSide, InstancedMesh, LineCurve3, Object3D, Shape, Vector3 } from "three";
import { useLayoutEffect, useMemo, useRef } from "react";
import { getPoint, themedColor } from "./utils";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import { createPoint, Point } from "../../../types/Point";
import { CameraType } from "../../../types/CameraType";
import { LINE_WIDTH, OPAQUE_DIM_LINK_COLOR_DARK, OPAQUE_DIM_LINK_COLOR_LIGHT, OPAQUE_HIGHLIGHTED_LINK_COLOR_DARK, OPAQUE_HIGHLIGHTED_LINK_COLOR_LIGHT, OPAQUE_LINK_COLOR_DARK, OPAQUE_LINK_COLOR_LIGHT, SEMITRANSPARENT_DIM_LINK_COLOR_DARK, SEMITRANSPARENT_DIM_LINK_COLOR_LIGHT, SEMITRANSPARENT_HIGHLIGHTED_LINK_COLOR_DARK, SEMITRANSPARENT_HIGHLIGHTED_LINK_COLOR_LIGHT, SEMITRANSPARENT_LINK_COLOR_DARK, SEMITRANSPARENT_LINK_COLOR_LIGHT } from "../../../constants/diagram";
import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import { useThree } from "@react-three/fiber";
import { transformedPoint } from "../../../utils/layout";

// https://codesandbox.io/p/sandbox/react-three-fiber-poc-segments-with-instancedmesh-and-hightlight-drag-2vcl9i
const LINE_BASE_SEGMENT = new Shape();
LINE_BASE_SEGMENT.moveTo(0, 0.5);
LINE_BASE_SEGMENT.lineTo(1, 0.5);
LINE_BASE_SEGMENT.lineTo(1, -0.5);
LINE_BASE_SEGMENT.lineTo(0, -0.5);
LINE_BASE_SEGMENT.lineTo(0, 0.5);

const TUBE_LINE_CURVE = new LineCurve3(new Vector3(0, 0, 0), new Vector3(1, 0, 0));

type Link = {
    conceptIndex: number,
    subconceptIndex: number,
    linkId: number,
    isVisible: boolean,
    isHighlighted: boolean,
}

export default function Links() {
    const instancedMeshRef = useRef<InstancedMesh>(null);
    const currentTheme = useGlobalsStore((state) => state.currentTheme);
    const subconceptsMapping = useDataStructuresStore((state) => state.lattice?.subconceptsMapping);
    const layout = useDiagramStore((state) => state.layout);
    const visibleConceptIndexes = useDiagramStore((state) => state.visibleConceptIndexes);
    const displayHighlightedSublatticeOnly = useDiagramStore((state) => state.displayHighlightedSublatticeOnly);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const dragOffset = useDiagramStore((state) => state.dragOffset);
    const conceptsToMoveIndexes = useDiagramStore((state) => state.conceptsToMoveIndexes);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const linksVisibleEnabled = useDiagramStore((state) => state.linksVisibleEnabled);
    const semitransparentLinksEnabled = useDiagramStore((state) => state.semitransparentLinksEnabled);
    const flatLinksEnabled = useDiagramStore((state) => state.flatLinksEnabled);
    const hoveredConceptIndex = useDiagramStore((state) => state.hoveredConceptIndex);
    const hoveredLinksHighlightingEnabled = useDiagramStore((state) => state.hoveredLinksHighlightingEnabled);
    const invalidate = useThree((state) => state.invalidate);

    const noHighlightedLinks = (displayHighlightedSublatticeOnly || !visibleConceptIndexes || visibleConceptIndexes.size === 0) &&
        (!hoveredLinksHighlightingEnabled || hoveredConceptIndex === null);

    const prepLinks = useMemo(() => {
        const links = new Array<Link>();

        if (!layout || !subconceptsMapping) {
            return links;
        }

        let i = 0;

        for (const node of layout) {
            for (const subconceptIndex of subconceptsMapping[node.conceptIndex]) {
                if (displayHighlightedSublatticeOnly && visibleConceptIndexes && !visibleConceptIndexes.has(subconceptIndex)) {
                    continue;
                }

                const isVisible = !!visibleConceptIndexes && visibleConceptIndexes.has(node.conceptIndex) && visibleConceptIndexes.has(subconceptIndex);

                links.push({
                    conceptIndex: node.conceptIndex,
                    subconceptIndex,
                    linkId: i,
                    isVisible,
                    isHighlighted: isVisible,
                });
                i++;
            }
        }

        return links;
    }, [subconceptsMapping, visibleConceptIndexes, displayHighlightedSublatticeOnly, layout, hoveredLinksHighlightingEnabled]);

    // This is here to reduce CPU to GPU trafic when hoveredConceptIndex changes
    // and hoveredLinksHighlightingEnabled is false
    const links = useMemo(() => {
        if (!hoveredLinksHighlightingEnabled) {
            return prepLinks;
        }

        for (const link of prepLinks) {
            link.isHighlighted = (hoveredConceptIndex === link.conceptIndex || hoveredConceptIndex === link.subconceptIndex) ||
                (hoveredConceptIndex === null && link.isVisible);
        }

        return [...prepLinks];
    }, [prepLinks, hoveredConceptIndex, hoveredLinksHighlightingEnabled]);

    const selectedLinks = useMemo(() =>
        links.filter((l) => conceptsToMoveIndexes.has(l.conceptIndex) || conceptsToMoveIndexes.has(l.subconceptIndex)),
    [links, conceptsToMoveIndexes]);

    // When there are lots of links, lots of data has to be transfered to the GPU which takes some time
    // This is especially noticable on node hovering
    // TODO: I could use the same hover effect as for nodes to avoid the need to updated instances

    useLayoutEffect(() => {
        if (!instancedMeshRef.current || !layout || !diagramOffsets) {
            return;
        }

        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;

        setLinksTransformMatrices(
            instancedMeshRef.current,
            conceptToLayoutIndexesMapping,
            links,
            new Set(),
            layout,
            diagramOffsets,
            [0, 0, 0],
            cameraType);
    }, [links, layout, subconceptsMapping, cameraType, diagramOffsets]);

    useLayoutEffect(() => {
        if (!instancedMeshRef.current || !layout || !diagramOffsets) {
            return;
        }

        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;

        setLinksTransformMatrices(
            instancedMeshRef.current,
            conceptToLayoutIndexesMapping,
            selectedLinks,
            conceptsToMoveIndexes,
            layout,
            diagramOffsets,
            dragOffset,
            cameraType);
    }, [selectedLinks, layout, subconceptsMapping, conceptsToMoveIndexes, dragOffset, cameraType, diagramOffsets]);

    useLayoutEffect(() => {
        if (noHighlightedLinks) {
            const defaultColor = semitransparentLinksEnabled ?
                themedColor(SEMITRANSPARENT_LINK_COLOR_LIGHT, SEMITRANSPARENT_LINK_COLOR_DARK, currentTheme) :
                themedColor(OPAQUE_LINK_COLOR_LIGHT, OPAQUE_LINK_COLOR_DARK, currentTheme);

            for (const link of links) {
                instancedMeshRef.current?.setColorAt(link.linkId, defaultColor);
            }
        }
        else {
            const dimColor = semitransparentLinksEnabled ?
                themedColor(SEMITRANSPARENT_DIM_LINK_COLOR_LIGHT, SEMITRANSPARENT_DIM_LINK_COLOR_DARK, currentTheme) :
                themedColor(OPAQUE_DIM_LINK_COLOR_LIGHT, OPAQUE_DIM_LINK_COLOR_DARK, currentTheme);
            const highlightedColor = semitransparentLinksEnabled ?
                themedColor(SEMITRANSPARENT_HIGHLIGHTED_LINK_COLOR_LIGHT, SEMITRANSPARENT_HIGHLIGHTED_LINK_COLOR_DARK, currentTheme) :
                themedColor(OPAQUE_HIGHLIGHTED_LINK_COLOR_LIGHT, OPAQUE_HIGHLIGHTED_LINK_COLOR_DARK, currentTheme);

            for (const link of links) {
                const color = link.isHighlighted ?
                    highlightedColor :
                    dimColor;

                instancedMeshRef.current?.setColorAt(link.linkId, color);
            }
        }

        if (instancedMeshRef.current?.instanceColor) {
            instancedMeshRef.current.instanceColor.needsUpdate = true;
            invalidate();
        }
    }, [links, noHighlightedLinks, semitransparentLinksEnabled, currentTheme]);

    return (
        <instancedMesh
            ref={instancedMeshRef}
            args={[undefined, undefined, links.length]}
            visible={linksVisibleEnabled}
            frustumCulled={false}>
            {flatLinksEnabled || cameraType === "2d" ?
                <shapeGeometry args={[LINE_BASE_SEGMENT]} /> :
                <tubeGeometry
                    args={[TUBE_LINE_CURVE, 1, 0.5, 3, false]} />}
            {semitransparentLinksEnabled ? 
                <meshBasicMaterial
                    transparent
                    opacity={0.3}
                    side={flatLinksEnabled ? DoubleSide : FrontSide} /> :
                <meshBasicMaterial
                    side={flatLinksEnabled ? DoubleSide : FrontSide}
                    color={"#ffffff"} />}
        </instancedMesh>
    );
}

function setLinksTransformMatrices(
    instancedMesh: InstancedMesh,
    conceptToLayoutIndexesMapping: Map<number, number>,
    links: Iterable<Link>,
    conceptsToMoveIndexes: Set<number>,
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    dragOffset: Point,
    cameraType: CameraType,
) {
    const temp = new Object3D();
    const initialDirection = new Vector3(1, 0, 0);
    const defaultDragOffset: Point = [0, 0, 0];

    for (const { conceptIndex, subconceptIndex, linkId, isHighlighted } of links) {
        const fromIndex = conceptToLayoutIndexesMapping.get(conceptIndex);
        const toIndex = conceptToLayoutIndexesMapping.get(subconceptIndex);

        if (fromIndex === undefined || toIndex === undefined || fromIndex >= layout.length || toIndex >= layout.length) {
            console.error(`Layout indexes should not be ${fromIndex} and ${toIndex}`);
            continue;
        }

        const zOffset = isHighlighted ? 0.001 : 0;

        const fromDef = layout[fromIndex];
        const fromOffset = getPoint(diagramOffsets, fromIndex);
        const from = transformedPoint(createPoint(fromDef.x, fromDef.y, fromDef.z), fromOffset, conceptsToMoveIndexes.has(conceptIndex) ? dragOffset : defaultDragOffset, cameraType, zOffset);

        const toDef = layout[toIndex];
        const toOffset = getPoint(diagramOffsets, toIndex);
        const to = transformedPoint(createPoint(toDef.x, toDef.y, toDef.z), toOffset, conceptsToMoveIndexes.has(subconceptIndex) ? dragOffset : defaultDragOffset, cameraType, zOffset);
        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const dz = to[2] - from[2];
        const length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

        temp.position.set(from[0], from[1], from[2]);
        temp.quaternion.setFromUnitVectors(initialDirection, new Vector3(dx, dy, dz).normalize());
        temp.scale.set(length, LINE_WIDTH, LINE_WIDTH);

        temp.updateMatrix();
        instancedMesh.setMatrixAt(linkId, temp.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
}