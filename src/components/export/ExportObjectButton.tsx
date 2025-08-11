import useExportObjectStore from "../../stores/export/useExportObjectStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createDownloadButtonsComponent from "./createDownloadButtonsComponent";
import createTextResultPreviewerComponent from "./createTextResultPreviewerComponent";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const TextPreviewer = createTextResultPreviewerComponent(useExportObjectStore);

const ITEMS: Array<ExportItem<ContextItemExportFormat>> = [
    {
        key: "json",
        label: "JSON",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportObjectStore, "exported-object.json"),
    },
    {
        key: "xml",
        label: "XML",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportObjectStore, "exported-object.xml"),
    },
    {
        key: "csv",
        label: "CSV",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportObjectStore, "exported-object.csv", "\n"),
    },
];

export default function ExportObjectButton(props: ExportButtonProps) {
    const context = useDataStructuresStore((state) => state.context);

    return (
        <ExportButton<ContextItemExportFormat>
            {...props}
            disabled={!context}
            items={ITEMS}
            useSelectedFormatStore={useExportObjectStore}
            onShowing={useExportObjectStore.getState().resetResult}
            onShown={useExportObjectStore.getState().triggerResultComputation}
            onHiding={useExportObjectStore.getState().resetResult} />
    );
}