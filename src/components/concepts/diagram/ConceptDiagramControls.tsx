import { LuScanSearch } from "react-icons/lu";
import Button from "../../inputs/Button";
import ToggleSwitch from "../../inputs/ToggleSwitch";
import { useContext } from "react";
import useDiagramStore from "../../../stores/useDiagramStore";
import { ZoomActionsContext } from "../../../contexts/ZoomActionsContext";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import { isInfimum, isSupremum } from "../../../types/FormalConcepts";

export default function ConceptDiagramControls(props: {
    selectedConceptIndex: number,
    visibleConceptIndexes: Set<number> | null,
}) {
    const concepts = useDataStructuresStore((state) => state.concepts);
    const context = useDataStructuresStore((state) => state.context);
    const selectedConcept = props.selectedConceptIndex !== null && concepts !== null && props.selectedConceptIndex < concepts.length ?
        concepts[props.selectedConceptIndex] :
        null;
    const isThisInfimum = selectedConcept && context && isInfimum(selectedConcept, context);
    const isThisSupremum = selectedConcept && context && isSupremum(selectedConcept, context);

    return (
        <>
            <Buttons
                conceptIndex={props.selectedConceptIndex} />

            {!isThisInfimum && !isThisSupremum &&
                <Controls
                    selectedConceptIndex={props.selectedConceptIndex}
                    visibleConceptIndexes={props.visibleConceptIndexes} />}
        </>
    );
}

function Buttons(props: {
    conceptIndex: number,
}) {
    return (
        <div
            className="flex gap-2 mt-2.5 px-4">
            <FocusButton
                conceptIndex={props.conceptIndex} />
        </div>
    );
}

function FocusButton(props: {
    conceptIndex: number,
}) {
    const zoomActionsRef = useContext(ZoomActionsContext);
    const layout = useDiagramStore((store) => store.layout);
    const diagramOffsets = useDiagramStore((store) => store.diagramOffsets);
    const visibleConceptIndexes = useDiagramStore((store) => store.visibleConceptIndexes);
    const displayHighlightedSublatticeOnly = useDiagramStore((store) => store.displayHighlightedSublatticeOnly);
    const isDisabled = !layout || !diagramOffsets || (displayHighlightedSublatticeOnly && !!visibleConceptIndexes && !visibleConceptIndexes.has(props.conceptIndex));

    function onClick() {
        if (isDisabled) {
            return;
        }

        zoomActionsRef.current?.zoomToConcept(props.conceptIndex);
    }

    return (
        <Button
            size="sm"
            variant="secondary"
            disabled={isDisabled}
            onClick={onClick}>
            <LuScanSearch />
            Focus
        </Button>
    );
}

function Controls(props: {
    selectedConceptIndex: number,
    visibleConceptIndexes: Set<number> | null,
}) {
    const lattice = useDataStructuresStore((state) => state.lattice);
    const upperConeOnlyConceptIndex = useDiagramStore((state) => state.upperConeOnlyConceptIndex);
    const lowerConeOnlyConceptIndex = useDiagramStore((state) => state.lowerConeOnlyConceptIndex);
    const setUpperConeOnlyConceptIndex = useDiagramStore((state) => state.setUpperConeOnlyConceptIndex);
    const setLowerConeOnlyConceptIndex = useDiagramStore((state) => state.setLowerConeOnlyConceptIndex);

    const isVisible = !props.visibleConceptIndexes || props.visibleConceptIndexes.has(props.selectedConceptIndex);

    function onUpperConeClick(e: React.ChangeEvent<HTMLInputElement>) {
        setUpperConeOnlyConceptIndex(
            e.currentTarget.checked ? props.selectedConceptIndex : null,
            !isVisible || lowerConeOnlyConceptIndex === props.selectedConceptIndex);
    }

    function onLowerConeClick(e: React.ChangeEvent<HTMLInputElement>) {
        setLowerConeOnlyConceptIndex(
            e.currentTarget.checked ? props.selectedConceptIndex : null,
            !isVisible || upperConeOnlyConceptIndex === props.selectedConceptIndex);
    }

    return (
        <section
            className="mx-4 mt-2.5 mb-2 flex gap-2 flex-col">
            <ToggleSwitch
                checked={upperConeOnlyConceptIndex === props.selectedConceptIndex}
                onChange={onUpperConeClick}
                disabled={lattice === null}>
                More general concepts only
            </ToggleSwitch>
            <ToggleSwitch
                checked={lowerConeOnlyConceptIndex === props.selectedConceptIndex}
                onChange={onLowerConeClick}
                disabled={lattice === null}>
                More specific concepts only
            </ToggleSwitch>
        </section>
    );
}