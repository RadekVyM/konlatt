import { LuChevronsUpDown } from "react-icons/lu";
import Button from "../../inputs/Button";
import { cn } from "../../../utils/tailwind";
import LabelsSelectionDialog from "./LabelsSelectionDialog";
import useDialog from "../../../hooks/useDialog";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";

export default function LabelsSelectionButton(props: {
    className?: string,
}) {
    const dialogState = useDialog();
    const objects = useDataStructuresStore((state) => state.context?.objects);
    const attributes = useDataStructuresStore((state) => state.context?.attributes);
    const selectedObjectLabels = useDiagramStore((state) => state.selectedObjectLabels);
    const selectedAttributeLabels = useDiagramStore((state) => state.selectedAttributeLabels);
    const setSelectedLabels = useDiagramStore((state) => state.setSelectedLabels);

    const allObjectsSelected = objects?.length === selectedObjectLabels.size;
    const allAttributesSelected = attributes?.length === selectedAttributeLabels.size;
    const noObjectsSelected = selectedObjectLabels.size === 0;
    const noAttributesSelected = selectedAttributeLabels.size === 0;

    return (
        <>
            <Button
                className={cn(props.className, "justify-between")}
                variant="container"
                onClick={dialogState.show}>
                <span>
                    {allObjectsSelected && allAttributesSelected ?
                        "All labels" :
                        noObjectsSelected && noAttributesSelected ?
                            "No labels" :
                            "Selected labels"}
                </span>
                <LuChevronsUpDown />
            </Button>

            <LabelsSelectionDialog
                state={dialogState}
                selectedObjectLabels={selectedObjectLabels}
                selectedAttributeLabels={selectedAttributeLabels}
                onApply={(selectedObjectLabels, selectedAttributeLabels) => setSelectedLabels(selectedObjectLabels, selectedAttributeLabels)} />
        </>
    );
}