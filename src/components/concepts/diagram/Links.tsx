import { DoubleSide, InstancedMesh, Object3D, Shape, Vector3 } from "three";
import { useLayoutEffect, useMemo, useRef } from "react";
import { getPoint, transformedPoint } from "./utils";
import useDiagramStore from "../../../stores/useDiagramStore";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import { createPoint, Point } from "../../../types/Point";
import { CameraType } from "../../../types/CameraType";
import { LINE_WIDTH } from "./constants";
import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";

// https://codesandbox.io/p/sandbox/react-three-fiber-poc-segments-with-instancedmesh-and-hightlight-drag-2vcl9i
const LINE_BASE_SEGMENT = new Shape();
LINE_BASE_SEGMENT.moveTo(0, 0.5);
LINE_BASE_SEGMENT.lineTo(1, 0.5);
LINE_BASE_SEGMENT.lineTo(1, -0.5);
LINE_BASE_SEGMENT.lineTo(0, -0.5);
LINE_BASE_SEGMENT.lineTo(0, 0.5);

type Link = {
    conceptIndex: number,
    subconceptIndex: number,
    linkId: number,
}

export default function Links() {
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
    const instancedMeshRef = useRef<InstancedMesh>(null);

    const links = useMemo(() => {
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

                links.push({
                    conceptIndex: node.conceptIndex,
                    subconceptIndex,
                    linkId: i,
                });
                i++;
            }
        }

        return links;
    }, [subconceptsMapping, visibleConceptIndexes, displayHighlightedSublatticeOnly, layout]);

    const selectedLinks = useMemo(() =>
        links.filter((l) => conceptsToMoveIndexes.has(l.conceptIndex) || conceptsToMoveIndexes.has(l.subconceptIndex)),
    [links, conceptsToMoveIndexes]);

    useLayoutEffect(() => {
        if (!instancedMeshRef.current || !layout || !diagramOffsets) {
            return;
        }

        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;

        setLinksTransformMatrices2(
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

        setLinksTransformMatrices2(
            instancedMeshRef.current,
            conceptToLayoutIndexesMapping,
            selectedLinks,
            conceptsToMoveIndexes,
            layout,
            diagramOffsets,
            dragOffset,
            cameraType);
    }, [selectedLinks, layout, subconceptsMapping, conceptsToMoveIndexes, dragOffset, cameraType, diagramOffsets]);

    return (
        <instancedMesh
            ref={instancedMeshRef}
            args={[undefined, undefined, links.length]}
            visible={linksVisibleEnabled}
            frustumCulled={false}>
            <shapeGeometry args={[LINE_BASE_SEGMENT]} />
            {semitransparentLinksEnabled ? 
                <meshBasicMaterial
                    color="#a8a8a8"
                    transparent
                    opacity={0.3}
                    side={DoubleSide} /> :
                <meshBasicMaterial
                    color="#e3e3e3"
                    opacity={1}
                    side={DoubleSide} />}
        </instancedMesh>
    );
}

function setLinksTransformMatrices2(
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

    for (const { conceptIndex, subconceptIndex, linkId } of links) {
        const fromIndex = conceptToLayoutIndexesMapping.get(conceptIndex);
        const toIndex = conceptToLayoutIndexesMapping.get(subconceptIndex);

        if (fromIndex === undefined || toIndex === undefined || fromIndex >= layout.length || toIndex >= layout.length) {
            continue;
        }

        const fromDef = layout[fromIndex];
        const fromOffset = getPoint(diagramOffsets, conceptIndex);
        const from = transformedPoint(createPoint(fromDef.x, fromDef.y, fromDef.z), fromOffset, conceptsToMoveIndexes.has(conceptIndex) ? dragOffset : defaultDragOffset, cameraType);

        const toDef = layout[toIndex];
        const toOffset = getPoint(diagramOffsets, subconceptIndex);
        const to = transformedPoint(createPoint(toDef.x, toDef.y, toDef.z), toOffset, conceptsToMoveIndexes.has(subconceptIndex) ? dragOffset : defaultDragOffset, cameraType);
        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const dz = to[2] - from[2];
        const length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

        temp.position.set(from[0], from[1], from[2]);
        temp.quaternion.setFromUnitVectors(initialDirection, new Vector3(dx, dy, dz).normalize());
        temp.scale.set(length, LINE_WIDTH, 1);

        temp.updateMatrix();
        instancedMesh.setMatrixAt(linkId, temp.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
}