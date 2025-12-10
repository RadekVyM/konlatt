import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import { useEffect, useMemo } from "react";
import { Point } from "../../../types/Point";
import { themedColor } from "./utils";
import { ConceptLatticeLabeling } from "../../../types/ConceptLatticeLabeling";
import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import { CameraType } from "../../../types/CameraType";
import { Billboard, Html, Text } from "@react-three/drei";
import { LABEL_COLOR_DARK, LABEL_COLOR_LIGHT } from "../../../constants/diagram";
import { ConceptLabel } from "../../../types/ConceptLabel";
import { createLabels } from "../../../utils/diagram";
import { useThree } from "@react-three/fiber";

export default function Labels() {
    const invalidate = useThree((state) => state.invalidate);
    const context = useDataStructuresStore((state) => state.context);
    const attributesLabeling = useDiagramStore((state) => state.attributesLabeling);
    const objectsLabeling = useDiagramStore((state) => state.objectsLabeling);
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);
    const lablesEnabled = useDiagramStore((state) => state.labelsEnabled);

    const attributeLabels = useLabels(
        "atribute",
        context?.attributes,
        attributesLabeling,
        layout,
        cameraType,
        horizontalScale,
        verticalScale,
        rotationDegrees,
        diagramOffsets,
        "top");
    const objectLabels = useLabels(
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

    useEffect(() => {
        invalidate();
    }, [attributeLabels, objectLabels]);

    return (
        <group
            visible={lablesEnabled}>
            {attributeLabels.map((label) => <Label {...label} key={label.id} />)}
            {objectLabels.map((label) => <Label {...label} key={label.id} />)}
        </group>
    );
}

function Label(props: Omit<ConceptLabel, "key">) {
    const currentTheme = useGlobalsStore((state) => state.currentTheme);
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
        <Billboard
            position={props.position}
            scale={isSelected ? 1.05 : 1}
            visible={isVisible}>
            <Text
                key={`${props.id}-${currentTheme}`}
                color={themedColor(LABEL_COLOR_LIGHT, LABEL_COLOR_DARK, currentTheme)}
                anchorX="center"
                anchorY={props.placement === "top" ? "bottom" : "top"}
                position={textPosition}
                textAlign="center"
                outlineWidth={0.01}
                outlineColor={themedColor(LABEL_COLOR_DARK, LABEL_COLOR_LIGHT, currentTheme)}
                fontWeight={600}
                fontSize={0.09}
                renderOrder={renderOrder}>
                <meshBasicMaterial depthTest={!isOnTop} depthWrite={!isOnTop} />
                {props.text}
            </Text>
        </Billboard>
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

function useLabels(
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

        return createLabels(
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