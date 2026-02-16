import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { useEffect, useMemo } from "react";
import { Html } from "@react-three/drei";
import { ConceptLabel } from "../../../types/ConceptLabel";
import { useThree } from "@react-three/fiber";
import { createLabelsWithPositions } from "../../../utils/diagram";
import { Point } from "../../../types/Point";
import { ConceptLatticeLabeling } from "../../../types/ConceptLatticeLabeling";
import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import { CameraType } from "../../../types/diagram/CameraType";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import R3FLabel from "../R3FLabel";

export default function Labels() {
    const invalidate = useThree((state) => state.invalidate);
    const { attributeLabels, objectLabels } = useLabels();

    useEffect(() => {
        invalidate();
    }, [attributeLabels, objectLabels]);

    return (
        <group>
            {attributeLabels.map((label) => <Label {...label} key={label.id} />)}
            {objectLabels.map((label) => <Label {...label} key={label.id} />)}
        </group>
    );
}

function Label(props: Omit<ConceptLabel, "key">) {
    const isDraggingNodes = useDiagramStore((state) => state.isDraggingNodes);
    const conceptsToMoveIndexes = useDiagramStore((state) => state.conceptsToMoveIndexes);
    const selectedConceptIndex = useDiagramStore((state) => state.selectedConceptIndex);
    const hoveredConceptIndex = useDiagramStore((state) => state.hoveredConceptIndex);
    const cameraType = useDiagramStore((state) => state.cameraType);

    const is2D = cameraType === "2d";
    const isVisible = !isDraggingNodes || !conceptsToMoveIndexes.has(props.conceptIndex);
    const isSelected = selectedConceptIndex === props.conceptIndex;
    const isHovered = hoveredConceptIndex === props.conceptIndex;
    const isOnTop = is2D || isSelected || isHovered;

    const offset = 0.15;
    const textPosition: [number, number, number] = [0, props.placement === "top" ? offset : -offset, 0];

    const renderOrder = isHovered ? 2 : (isSelected || is2D) ? 1 : 0;

    return (
        <R3FLabel
            text={props.text}
            position={props.position}
            textPosition={textPosition}
            anchorY={props.placement === "top" ? "bottom" : "top"}
            depthTest={!isOnTop}
            id={props.id}
            renderOrder={renderOrder}
            scale={isSelected ? 1.05 : 1}
            visible={isVisible} />
    );
}

// @ts-ignore
function LabelHtml(props: {
    id: string,
    text: string,
}) {
    return (
        <Html
            center>
            <span className="text-xs text-nowrap">{props.text}</span>
        </Html>
    );
}

function useLabels() {
    const context = useDataStructuresStore((state) => state.context);
    const attributesLabeling = useDiagramStore((state) => state.filteredAttributesLabeling);
    const objectsLabeling = useDiagramStore((state) => state.filteredObjectsLabeling);
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);

    const attributeLabels = useLabelsInternal(
        "attribute",
        context?.attributes,
        attributesLabeling,
        layout,
        cameraType,
        horizontalScale,
        verticalScale,
        rotationDegrees,
        diagramOffsets,
        "top");
    const objectLabels = useLabelsInternal(
        "object",
        context?.objects,
        objectsLabeling,
        layout,
        cameraType,
        horizontalScale,
        verticalScale,
        rotationDegrees,
        diagramOffsets,
        "bottom");

    return {
        attributeLabels,
        objectLabels,
    };
}

function useLabelsInternal(
    keyPrefix: string,
    labels: ReadonlyArray<string> | undefined,
    labeling: ConceptLatticeLabeling | null,
    layout: ConceptLatticeLayout | null,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    diagramOffsets: Array<Point> | null,
    placement: "top" | "bottom",
) {
    return useMemo(() => {
        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;

        return createLabelsWithPositions(
            keyPrefix,
            labels,
            labeling,
            layout,
            conceptToLayoutIndexesMapping,
            cameraType,
            horizontalScale,
            verticalScale,
            rotationDegrees,
            diagramOffsets,
            placement);
    }, [keyPrefix, labels, labeling, layout, cameraType, diagramOffsets, horizontalScale, verticalScale, rotationDegrees]);
}