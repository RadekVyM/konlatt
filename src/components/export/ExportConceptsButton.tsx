import useExportConceptsStore from "../../stores/export/useExportConceptsStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import createDownloadButtonsComponent from "./createDownloadButtonsComponent";
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
        buttons: createDownloadButtonsComponent(useExportConceptsStore, "exported-concepts.json"),
    },
    {
        key: "xml",
        label: "XML",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportConceptsStore, "exported-concepts.xml"),
    },
];

export default function ExportConceptsButton(props: ExportButtonProps) {
    // Result needs to be reset on hiding to prevent memomory leaks
    const context = useDataStructuresStore((state) => state.context);
    const concepts = useDataStructuresStore((state) => state.concepts);

    return (
        <ExportButton<ConceptExportFormat>
            {...props}
            disabled={!context || !concepts}
            items={ITEMS}
            useSelectedFormatStore={useExportConceptsStore}
            onShowing={useExportConceptsStore.getState().resetResult}
            onShown={useExportConceptsStore.getState().triggerResultComputation}
            onHiding={useExportConceptsStore.getState().resetResult} />
    );
}