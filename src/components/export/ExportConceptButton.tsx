import useExportConceptStore from "../../stores/export/useExportConceptStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import createDownloadButtonsComponent from "./createDownloadButtonsComponent";
import createTextResultPreviewerComponent from "./createTextResultPreviewerComponent";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const TextPreviewer = createTextResultPreviewerComponent(useExportConceptStore);

const ITEMS: Array<ExportItem<ConceptExportFormat>> = [
    {
        key: "json",
        label: "JSON",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportConceptStore, "exported-concept.json"),
    },
    {
        key: "xml",
        label: "XML",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportConceptStore, "exported-concept.xml"),
    },
];

export default function ExportConceptButton(props: ExportButtonProps) {
    const context = useDataStructuresStore((state) => state.context);
    const concepts = useDataStructuresStore((state) => state.concepts);

    return (
        <ExportButton<ConceptExportFormat>
            {...props}
            disabled={!context || !concepts}
            items={ITEMS}
            useSelectedFormatStore={useExportConceptStore}
            onShowing={useExportConceptStore.getState().resetResult}
            onShown={useExportConceptStore.getState().triggerResultComputation}
            onHiding={useExportConceptStore.getState().resetResult} />
    );
}