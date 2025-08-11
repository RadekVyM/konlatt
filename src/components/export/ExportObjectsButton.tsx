import useExportObjectsStore from "../../stores/export/useExportObjectsStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createDownloadButtonsComponent from "./createDownloadButtonsComponent";
import createTextResultPreviewerComponent from "./createTextResultPreviewerComponent";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const TextPreviewer = createTextResultPreviewerComponent(useExportObjectsStore);

const ITEMS: Array<ExportItem<ContextItemExportFormat>> = [
    {
        key: "json",
        label: "JSON",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportObjectsStore, "exported-objects.json"),
    },
    {
        key: "xml",
        label: "XML",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportObjectsStore, "exported-objects.xml"),
    },
    {
        key: "csv",
        label: "CSV",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportObjectsStore, "exported-objects.csv", "\n"),
    },
];

export default function ExportObjectsButton(props: ExportButtonProps) {
    const context = useDataStructuresStore((state) => state.context);

    return (
        <ExportButton<ContextItemExportFormat>
            {...props}
            disabled={!context}
            items={ITEMS}
            useSelectedFormatStore={useExportObjectsStore}
            onShowing={useExportObjectsStore.getState().resetResult}
            onShown={useExportObjectsStore.getState().triggerResultComputation}
            onHiding={useExportObjectsStore.getState().resetResult} />
    );
}