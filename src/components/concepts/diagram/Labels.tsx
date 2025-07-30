import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import { useMemo } from "react";
import { createPoint, Point } from "../../../types/Point";
import { getPoint, themedColor } from "./utils";
import { ConceptLatticeLabeling } from "../../../types/ConceptLatticeLabeling";
import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import { CameraType } from "../../../types/CameraType";
import { Billboard, Html, Text } from "@react-three/drei";
import { LABEL_COLOR_DARK, LABEL_COLOR_LIGHT } from "../../../constants/diagram";
import { transformedPoint } from "../../../utils/layout";

type Label = {
    id: string,
    text: string,
    position: Point,
    conceptIndex: number,
    anchorY: "top" | "bottom",
}

export default function Labels() {
    const context = useDataStructuresStore((state) => state.context);
    const attributesLabeling = useDataStructuresStore((state) => state.lattice?.attributesLabeling);
    const objectsLabeling = useDataStructuresStore((state) => state.lattice?.objectsLabeling);
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
        "bottom");
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
        "top");

    return (
        <group
            visible={lablesEnabled}>
            {attributeLabels.map((label) => <Label {...label} key={label.id} />)}
            {objectLabels.map((label) => <Label {...label} key={label.id} />)}
        </group>
    );
}

function Label(props: Omit<Label, "key">) {
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
    const textPosition: [number, number, number] = [0, props.anchorY === "bottom" ? offset : -offset, 0];

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
                anchorY={props.anchorY}
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
    labeling: ConceptLatticeLabeling | undefined,
    layout: ConceptLatticeLayout | null,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    diagramOffsets: Array<Point> | null,
    anchorY: "top" | "bottom",
) {
    return useMemo(() => {
        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;
        const newLabels = new Array<Label>();
        const zOffset = cameraType === "2d" ? 0.002 : 0;

        if (!labels || !labeling || !layout || !diagramOffsets || conceptToLayoutIndexesMapping.size !== layout.length) {
            return newLabels;
        }

        for (const [conceptIndex, labelIndexes] of labeling) {
            const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex);

            if (labelIndexes.length === 0 || layoutIndex === undefined || layoutIndex >= layout.length) {
                continue;
            }

            const layoutPoint = layout[layoutIndex];

            const position = transformedPoint(
                createPoint(layoutPoint.x, layoutPoint.y, layoutPoint.z),
                getPoint(diagramOffsets, layoutIndex),
                [0, 0, 0],
                horizontalScale,
                verticalScale,
                rotationDegrees,
                cameraType,
                zOffset);

            const text = createLabelText(labelIndexes, labels);

            newLabels.push({
                id: `${keyPrefix}-${conceptIndex}`,
                position,
                text,
                conceptIndex,
                anchorY,
            });
        }

        return newLabels;
    }, [keyPrefix, labels, labeling, layout, cameraType, diagramOffsets, horizontalScale, verticalScale, rotationDegrees]);
}

function createLabelText(labelIndexes: ReadonlyArray<number>, labels: ReadonlyArray<string>) {
    const maxLineLength = 25;
    const maxLinesCount = 3;
    const textSegments = new Array<string>();
    let lineLength = 0;
    let currentLine = 1;

    for (const index of labelIndexes) {
        const label = labels[index];

        if (lineLength + label.length <= maxLineLength) {
            textSegments.push(label);
            lineLength += label.length + 2;
        }
        else if (currentLine < maxLinesCount && label.length <= maxLineLength) {
            lineLength = label.length + 2;
            currentLine++;

            textSegments.push(`\n${label}`);
            lineLength += label.length + 2;
        }
    }

    if (textSegments.length === 0) {
        const label = labels[labelIndexes[0]];

        if (label.length <= maxLineLength + 3) {
            return label;
        }

        return `${label.slice(0, maxLineLength)}...`;
    }

    return textSegments.join(", ") + (labelIndexes.length === textSegments.length ? "" : "...");
}