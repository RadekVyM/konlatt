import useExportDiagramStore from "../../../stores/export/diagram/useExportDiagramStore";
import DebouncedNumberInput from "../../inputs/DebouncedNumberInput";
import { DEBOUNCE_DELAY } from "./constants";

export default function LabelLineInputs() {
    const maxLabelLineLength = useExportDiagramStore((state) => state.maxLabelLineLength);
    const maxLabelLineCount = useExportDiagramStore((state) => state.maxLabelLineCount);
    const setMaxLabelLineLength = useExportDiagramStore((state) => state.setMaxLabelLineLength);
    const setMaxLabelLineCount = useExportDiagramStore((state) => state.setMaxLabelLineCount);

    return (
        <div
            className="grid grid-cols-2 gap-2">
            <DebouncedNumberInput
                id="export-diagram-text-line-length"
                delay={DEBOUNCE_DELAY}
                label="Maximum line length"
                min={1}
                value={maxLabelLineLength}
                onChange={setMaxLabelLineLength} />
            <DebouncedNumberInput
                id="export-diagram-text-line-count"
                delay={DEBOUNCE_DELAY}
                label="Maximum lines count"
                min={1}
                value={maxLabelLineCount}
                onChange={setMaxLabelLineCount} />
        </div>
    );
}