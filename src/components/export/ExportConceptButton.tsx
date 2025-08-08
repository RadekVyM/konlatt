import useExportConceptStore from "../../stores/export/useExportConceptStore";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const ITEMS: Array<ExportItem<ConceptExportFormat>> = [
    {
        key: "json",
        label: "JSON",
        content: () => <></>,
    },
    {
        key: "xml",
        label: "XML",
        content: () => <></>,
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