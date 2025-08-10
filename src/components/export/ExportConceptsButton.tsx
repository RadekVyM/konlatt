import useExportConceptsStore from "../../stores/export/useExportConceptsStore";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import createTextResultPreviewerComponent from "./createTextResultPreviewerComponent";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const TextPreviewer = createTextResultPreviewerComponent(useExportConceptsStore);

const ITEMS: Array<ExportItem<ConceptExportFormat>> = [
    {
        key: "json",
        label: "JSON",
        content: TextPreviewer,
    },
    {
        key: "xml",
        label: "XML",
        content: TextPreviewer,
    },
];

export default function ExportConceptsButton(props: ExportButtonProps) {
    // Result needs to be reset on hiding to prevent memomory leaks

    return (
        <ExportButton<ConceptExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportConceptsStore}
            onShowing={useExportConceptsStore.getState().resetResult}
            onShown={useExportConceptsStore.getState().triggerResultComputation}
            onHiding={useExportConceptsStore.getState().resetResult} />
    );
}