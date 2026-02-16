import { useEffect, useMemo } from "react";
import { ConceptLabel, PositionedConceptLabel } from "../../../types/ConceptLabel";
import { useThree } from "@react-three/fiber";
import { createLabels } from "../../../utils/diagram";
import { ConceptLatticeLabeling } from "../../../types/ConceptLatticeLabeling";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import useExplorerStore from "../../../stores/explorer/useExplorerStore";
import { ExplorerConcept } from "../../../types/explorer/ExplorerConcept";
import R3FLabel from "../R3FLabel";

export default function Labels() {
    const invalidate = useThree((state) => state.invalidate);
    const { attributeLabels, objectLabels } = useLabels();

    useEffect(() => {
        invalidate();
    }, [attributeLabels, objectLabels]);

    return (
        <group>
            {attributeLabels.map((label) => <LabelInternal {...label} key={label.id} />)}
            {objectLabels.map((label) => <LabelInternal {...label} key={label.id} />)}
        </group>
    );
}

function LabelInternal(props: Omit<ConceptLabel, "key">) {
    const hoveredConceptIndex = useExplorerStore((state) => state.hoveredConceptIndex);

    const isHovered = hoveredConceptIndex === props.conceptIndex;

    const offset = 0.15;
    const textPosition: [number, number, number] = [0, props.placement === "top" ? offset : -offset, 0];

    const renderOrder = isHovered ? 2 : 0;

    return (
        <R3FLabel
            text={props.text}
            position={props.position}
            textPosition={textPosition}
            anchorY={props.placement === "top" ? "bottom" : "top"}
            depthTest={!isHovered}
            id={props.id}
            renderOrder={renderOrder}
            visible={true}
            scale={1} />
    );
}

function useLabels() {
    const context = useDataStructuresStore((state) => state.context);
    const attributesLabeling = useDataStructuresStore((state) => state.lattice?.attributesLabeling);
    const objectsLabeling = useDataStructuresStore((state) => state.lattice?.objectsLabeling);
    const concepts = useExplorerStore((state) => state.concepts);

    return useMemo(() => ({
        attributeLabels: createPositionedLabels(
            "attribute",
            context?.attributes,
            attributesLabeling || null,
            concepts,
            "top"),
        objectLabels: createPositionedLabels(
            "object",
            context?.objects,
            objectsLabeling || null,
            concepts,
            "bottom"),
    }), [context, attributesLabeling, objectsLabeling, concepts]);
}

function createPositionedLabels(
    keyPrefix: string,
    labels: ReadonlyArray<string> | undefined,
    labeling: ConceptLatticeLabeling | null,
    concepts: ReadonlyArray<ExplorerConcept>,
    placement: "top" | "bottom",
) {
    const selectedAttributesLabeling = new Map<number, ReadonlyArray<number>>();

    for (const concept of concepts) {
        const label = labeling?.get(concept.conceptIndex);

        if (label) {
            selectedAttributesLabeling.set(concept.conceptIndex, label);
        }
    }

    const positionedLabels: Array<PositionedConceptLabel> = [];
    const conceptToLayoutIndexesMapping = useExplorerStore.getState().conceptToLayoutIndexesMapping;

    for (const label of createLabels(
        keyPrefix,
        labels,
        selectedAttributesLabeling,
        placement)
    ) {
        const layoutIndex = conceptToLayoutIndexesMapping.get(label.conceptIndex);

        if (layoutIndex === undefined || layoutIndex >= concepts.length) {
            continue;
        }

        const concept = concepts[layoutIndex];

        positionedLabels.push({
            ...label,
            position: concept.position,
        });
    }

    return positionedLabels;
}