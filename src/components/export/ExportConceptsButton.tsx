import useExportConceptsStore from "../../stores/export/useExportConceptsStore";
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