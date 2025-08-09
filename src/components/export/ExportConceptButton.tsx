import useExportConceptStore from "../../stores/export/useExportConceptStore";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import TextPreviewer from "../TextPreviewer";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const ITEMS: Array<ExportItem<ConceptExportFormat>> = [
    {
        key: "json",
        label: "JSON",
        content: TextResult,
    },
    {
        key: "xml",
        label: "XML",
        content: TextResult,
    },
];

export default function ExportConceptButton(props: ExportButtonProps) {
    return (
        <ExportButton<ConceptExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportConceptStore}
            onShowing={useExportConceptStore.getState().resetResult}
            onShown={useExportConceptStore.getState().triggerResultComputation} />
    );
}

function TextResult() {
    const result = useExportConceptStore((state) => state.result);
    const selectedFormat = useExportConceptStore((state) => state.selectedFormat);

    return (
        <TextPreviewer
            key={selectedFormat}
            lines={result || []}
            className="w-full h-full" />
    );
}