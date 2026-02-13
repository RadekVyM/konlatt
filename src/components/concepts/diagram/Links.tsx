import { DoubleSide, FrontSide, InstancedMesh, LineCurve3, Object3D, Shape, Vector3 } from "three";
import { useLayoutEffect, useMemo, useRef } from "react";
import { getPoint, themedColor } from "./utils";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import { createPoint, Point } from "../../../types/Point";
import { CameraType } from "../../../types/CameraType";
import { LINE_THICKNESS, OPAQUE_COLORED_LINK_COLOR_DARK, OPAQUE_COLORED_LINK_COLOR_LIGHT, OPAQUE_DIM_LINK_COLOR_DARK, OPAQUE_DIM_LINK_COLOR_LIGHT, OPAQUE_HIGHLIGHTED_LINK_COLOR_DARK, OPAQUE_HIGHLIGHTED_LINK_COLOR_LIGHT, OPAQUE_LINK_COLOR_DARK, OPAQUE_LINK_COLOR_LIGHT, PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT, SEMITRANSPARENT_DIM_LINK_COLOR_DARK, SEMITRANSPARENT_DIM_LINK_COLOR_LIGHT, SEMITRANSPARENT_HIGHLIGHTED_LINK_COLOR_DARK, SEMITRANSPARENT_HIGHLIGHTED_LINK_COLOR_LIGHT, SEMITRANSPARENT_LINK_COLOR_DARK, SEMITRANSPARENT_LINK_COLOR_LIGHT } from "../../../constants/diagram";
import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import { useThree } from "@react-three/fiber";
import { transformedPoint } from "../../../utils/layout";
import { Link } from "../../../types/Link";
import useLinks from "./useLinks";

// https://codesandbox.io/p/sandbox/react-three-fiber-poc-segments-with-instancedmesh-and-hightlight-drag-2vcl9i
// Base geometry for flat 2D lines (a thin rectangle)
const LINE_BASE_SEGMENT = new Shape();
LINE_BASE_SEGMENT.moveTo(0, 0.5);
LINE_BASE_SEGMENT.lineTo(1, 0.5);
LINE_BASE_SEGMENT.lineTo(1, -0.5);
LINE_BASE_SEGMENT.lineTo(0, -0.5);
LINE_BASE_SEGMENT.lineTo(0, 0.5);

// Base curve for 3D tube lines
const TUBE_LINE_CURVE = new LineCurve3(new Vector3(0, 0, 0), new Vector3(1, 0, 0));

/**
 * R3F component that renders all links of the current diagram.
 */
export default function Links() {
    const instancedMeshRef = useRef<InstancedMesh>(null);

    // Refs to track state changes manually for optimized useMemo logic
    const previousHoveredConceptIndexRef = useRef<number | null>(null);
    const previousSelectedConceptIndexRef = useRef<number | null>(null);
    const previousHoveredLinksHighlightingEnabledRef = useRef<boolean | null>(null);
    const previousSelectedLinksHighlightingEnabledRef = useRef<boolean | null>(null);

    const currentTheme = useGlobalsStore((state) => state.currentTheme);
    const subconceptsMapping = useDataStructuresStore((state) => state.lattice?.subconceptsMapping);
    const layout = useDiagramStore((state) => state.layout);
    const sublatticeConceptIndexes = useDiagramStore((state) => state.sublatticeConceptIndexes);
    const filteredConceptIndexes = useDiagramStore((state) => state.filteredConceptIndexes);
    const displayHighlightedSublatticeOnly = useDiagramStore((state) => state.displayHighlightedSublatticeOnly);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const dragOffset = useDiagramStore((state) => state.dragOffset);
    const conceptsToMoveIndexes = useDiagramStore((state) => state.conceptsToMoveIndexes);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);
    const linksVisibleEnabled = useDiagramStore((state) => state.linksVisibleEnabled);
    const semitransparentLinksEnabled = useDiagramStore((state) => state.semitransparentLinksEnabled);
    const flatLinksEnabled = useDiagramStore((state) => state.flatLinksEnabled);
    const selectedConceptIndex = useDiagramStore((state) => state.selectedConceptIndex);
    const hoveredConceptIndex = useDiagramStore((state) => state.hoveredConceptIndex);
    const hoveredLinksHighlightingEnabled = useDiagramStore((state) => state.hoveredLinksHighlightingEnabled);
    const selectedLinksHighlightingEnabled = useDiagramStore((state) => state.selectedLinksHighlightingEnabled);
    const invalidate = useThree((state) => state.invalidate);

    // Logic to determine if any links should be visually "highlighted" vs "dimmed"
    const isSublatticeHighlighted = !sublatticeConceptIndexes || sublatticeConceptIndexes.size === 0;
    const noFilteredConcepts = !filteredConceptIndexes || filteredConceptIndexes.size === 0 || filteredConceptIndexes.size === subconceptsMapping?.length;
    const noHighlightedLinks = (displayHighlightedSublatticeOnly || isSublatticeHighlighted) && noFilteredConcepts &&
        (!hoveredLinksHighlightingEnabled || hoveredConceptIndex === null) &&
        (!selectedLinksHighlightingEnabled || selectedConceptIndex === null);

    const useFlatLinks = flatLinksEnabled || cameraType === "2d";

    const prepLinks = useLinks();

    // When there are lots of links, lots of data has to be transfered to the GPU which takes some time
    // This is especially noticable on node hovering

    // This is here to reduce CPU to GPU trafic.
    // Compares previous interaction states to skip creation of a new array instance (which would cause rerender)
    // and heavy array iterations when highlighting is disabled or irrelevant.
    const links = useMemo(() => {
        const initialRender = previousSelectedLinksHighlightingEnabledRef.current === null &&
            previousHoveredLinksHighlightingEnabledRef.current === null &&
            previousSelectedConceptIndexRef.current === null &&
            previousHoveredConceptIndexRef.current === null;
        const selectionEnabledChanged = previousSelectedLinksHighlightingEnabledRef.current !== selectedLinksHighlightingEnabled;
        const hoverEnabledChanged = previousHoveredLinksHighlightingEnabledRef.current !== hoveredLinksHighlightingEnabled;
        const selectionChanged = previousSelectedConceptIndexRef.current !== selectedConceptIndex;
        const hoverChanged = previousHoveredConceptIndexRef.current !== hoveredConceptIndex;

        // Update refs for the next cycle
        previousSelectedLinksHighlightingEnabledRef.current = selectedLinksHighlightingEnabled;
        previousHoveredLinksHighlightingEnabledRef.current = hoveredLinksHighlightingEnabled;
        previousSelectedConceptIndexRef.current = selectedConceptIndex;
        previousHoveredConceptIndexRef.current = hoveredConceptIndex;

        // Nothing could be changed before the initial render
        if (initialRender) {
            return prepLinks;
        }

        // If highlighting is disabled and didn't just turn on, return base links
        if (!selectionEnabledChanged && !hoverEnabledChanged && !hoveredLinksHighlightingEnabled && !selectedLinksHighlightingEnabled) {
            return prepLinks;
        }

        // Skip if selection hasn't changed and hovering isn't active
        if (!selectionEnabledChanged && !selectionChanged && !hoveredLinksHighlightingEnabled) {
            return prepLinks;
        }

        // Skip if hover hasn't changed and selection isn't active
        if (!selectionEnabledChanged && !hoverChanged && !selectedLinksHighlightingEnabled) {
            return prepLinks;
        }

        for (const link of prepLinks) {
            const isHovered = hoveredLinksHighlightingEnabled &&
                (hoveredConceptIndex === link.conceptIndex || hoveredConceptIndex === link.subconceptIndex);
            const isSelected = selectedLinksHighlightingEnabled &&
                (selectedConceptIndex === link.conceptIndex || selectedConceptIndex === link.subconceptIndex);
            link.isColored = isSelected || isHovered;
        }

        return [...prepLinks];
    }, [prepLinks, hoveredConceptIndex, selectedConceptIndex, hoveredLinksHighlightingEnabled, selectedLinksHighlightingEnabled]);

    const selectedLinks = useMemo(() =>
        links.filter((l) => conceptsToMoveIndexes.has(l.conceptIndex) || conceptsToMoveIndexes.has(l.subconceptIndex)),
    [links, conceptsToMoveIndexes]);

    // Update transformation matrices for all links when layout or visibility changes
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
            cameraType,
            horizontalScale,
            verticalScale,
            rotationDegrees);
    }, [links, layout, subconceptsMapping, cameraType, diagramOffsets, horizontalScale, verticalScale, rotationDegrees]);

    // Update matrices specifically for links whose nodes are being moved to maintain sync with nodes
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
            cameraType,
            horizontalScale,
            verticalScale,
            rotationDegrees);
    }, [selectedLinks, layout, subconceptsMapping, conceptsToMoveIndexes, dragOffset, cameraType, diagramOffsets, horizontalScale, verticalScale, rotationDegrees]);

    // Handle color updates
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
            const coloredColor = semitransparentLinksEnabled ?
                themedColor(PRIMARY_COLOR_LIGHT, PRIMARY_COLOR_DARK, currentTheme) :
                themedColor(OPAQUE_COLORED_LINK_COLOR_LIGHT, OPAQUE_COLORED_LINK_COLOR_DARK, currentTheme);

            for (const link of links) {
                const color = link.isColored ?
                    coloredColor :
                    link.isHighlighted ?
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
            {useFlatLinks ?
                <shapeGeometry args={[LINE_BASE_SEGMENT]} /> :
                <tubeGeometry
                    args={[TUBE_LINE_CURVE, 1, 0.5, 3, false]} />}
            {semitransparentLinksEnabled ? 
                <meshBasicMaterial
                    transparent
                    opacity={0.3}
                    side={useFlatLinks ? DoubleSide : FrontSide} /> :
                <meshBasicMaterial
                    side={useFlatLinks ? DoubleSide : FrontSide}
                    color={"#ffffff"} />}
        </instancedMesh>
    );
}

/**
 * Calculates and applies the Position, Rotation, and Scale for each link instance.
 * Links are stretched from the 'from' point to the 'to' point.
 */
function setLinksTransformMatrices(
    instancedMesh: InstancedMesh,
    conceptToLayoutIndexesMapping: Map<number, number>,
    links: Iterable<Link>,
    conceptsToMoveIndexes: Set<number>,
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    dragOffset: Point,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
) {
    const temp = new Object3D();
    const initialDirection = new Vector3(1, 0, 0);
    const defaultDragOffset: Point = [0, 0, 0];

    for (const { conceptIndex, subconceptIndex, linkId, isHighlighted: isVisible, isColored: isHighlighted } of links) {
        const fromIndex = conceptToLayoutIndexesMapping.get(conceptIndex);
        const toIndex = conceptToLayoutIndexesMapping.get(subconceptIndex);

        if (fromIndex === undefined || toIndex === undefined || fromIndex >= layout.length || toIndex >= layout.length) {
            console.error(`Layout indexes should not be ${fromIndex} and ${toIndex}`);
            continue;
        }

        // Slightly offset highlighted links toward camera to prevent Z-fighting
        const zOffset = isVisible || isHighlighted ? 0.001 : 0;

        const fromDef = layout[fromIndex];
        const fromOffset = getPoint(diagramOffsets, fromIndex);
        const from = transformedPoint(
            createPoint(fromDef.x, fromDef.y, fromDef.z),
            fromOffset,
            conceptsToMoveIndexes.has(conceptIndex) ? dragOffset : defaultDragOffset,
            horizontalScale,
            verticalScale,
            rotationDegrees,
            cameraType,
            zOffset);

        const toDef = layout[toIndex];
        const toOffset = getPoint(diagramOffsets, toIndex);
        const to = transformedPoint(
            createPoint(toDef.x, toDef.y, toDef.z),
            toOffset,
            conceptsToMoveIndexes.has(subconceptIndex) ? dragOffset : defaultDragOffset,
            horizontalScale,
            verticalScale,
            rotationDegrees,
            cameraType,
            zOffset);

        // Vector math for segment placement
        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const dz = to[2] - from[2];
        const length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

        // Position: Move to the start point
        temp.position.set(from[0], from[1], from[2]);
        // Rotation: Orient towards the end point
        temp.quaternion.setFromUnitVectors(initialDirection, new Vector3(dx, dy, dz).normalize());
        // Scale: Stretch X-axis to reach the length, keep Y/Z at LINE_THICKNESS
        temp.scale.set(length, LINE_THICKNESS, LINE_THICKNESS);

        temp.updateMatrix();
        instancedMesh.setMatrixAt(linkId, temp.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
}