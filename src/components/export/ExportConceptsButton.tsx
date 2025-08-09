import useExportConceptsStore from "../../stores/export/useExportConceptsStore";
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

export default function ExportConceptsButton(props: ExportButtonProps) {
    return (
        <ExportButton<ConceptExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportConceptsStore}
            onShowing={useExportConceptsStore.getState().resetResult}
            onShown={useExportConceptsStore.getState().triggerResultComputation} />
    );
}

function TextResult() {
    const result = useExportConceptsStore((state) => state.result);
    const selectedFormat = useExportConceptsStore((state) => state.selectedFormat);

    return (
        <TextPreviewer
            key={selectedFormat}
            lines={result || []}
            className="w-full h-full" />
    );
}