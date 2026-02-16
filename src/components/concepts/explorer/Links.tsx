import { useLayoutEffect, useMemo, useRef } from "react";
import { FrontSide, InstancedMesh, Object3D, Vector3 } from "three";
import { LINE_BASE_SEGMENT, LINE_THICKNESS, SEMITRANSPARENT_LINK_COLOR_DARK, SEMITRANSPARENT_LINK_COLOR_LIGHT } from "../../../constants/canvas-drawing";
import useExplorerStore from "../../../stores/explorer/useExplorerStore";
import { Point } from "../../../types/Point";
import { setupLinkTransform } from "../../../utils/diagram";
import { useThree } from "@react-three/fiber";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import { themedColor } from "../diagram/utils";

type ExplorerLink = {
    start: Point,
    end: Point,
}

export default function Links() {
    const instancedMeshRef = useRef<InstancedMesh>(null);
    const links = useLinks();
    const currentTheme = useGlobalsStore((state) => state.currentTheme);
    const invalidate = useThree((state) => state.invalidate);

    useLayoutEffect(() => {
        if (!instancedMeshRef.current) {
            return;
        }

        const temp = new Object3D();
        const initialDirection = new Vector3(1, 0, 0);

        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            setupLinkTransform(temp, link.start, link.end, initialDirection, LINE_THICKNESS);
            instancedMeshRef.current.setMatrixAt(i, temp.matrix);
        }

        instancedMeshRef.current.instanceMatrix.needsUpdate = true;

        invalidate();
    }, [links]);

    return (
        <instancedMesh
            key={links.length}
            ref={instancedMeshRef}
            args={[undefined, undefined, links.length]}
            frustumCulled={false}>
            <shapeGeometry args={[LINE_BASE_SEGMENT]} />
            <meshBasicMaterial
                transparent
                opacity={0.3}
                side={FrontSide}
                color={themedColor(SEMITRANSPARENT_LINK_COLOR_LIGHT, SEMITRANSPARENT_LINK_COLOR_DARK, currentTheme)} />
        </instancedMesh>
    );
}

function useLinks() {
    const concepts = useExplorerStore((state) => state.concepts);
    const selectedConceptIndex = useExplorerStore((state) => state.selectedConceptIndex);

    return useMemo(() => {
        const newLinks = new Array<ExplorerLink>();

        if (selectedConceptIndex === null) {
            return newLinks;
        }

        const conceptToLayoutIndexesMapping = useExplorerStore.getState().conceptToLayoutIndexesMapping;
        const selectedConceptLayoutIndex = conceptToLayoutIndexesMapping.get(selectedConceptIndex);

        if (selectedConceptLayoutIndex === undefined) {
            return newLinks;
        }

        const selectedConcept = concepts[selectedConceptLayoutIndex];

        for (const concept of concepts) {
            if (concept.conceptIndex === selectedConceptIndex) {
                continue;
            }

            newLinks.push({
                start: selectedConcept.position,
                end: concept.position,
            });
        }

        return newLinks;
    }, [concepts, selectedConceptIndex]);
}
