import useExportObjectsStore from "../../stores/export/useExportObjectsStore";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
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
    },
    {
        key: "xml",
        label: "XML",
        content: TextPreviewer,
    },
    {
        key: "csv",
        label: "CSV",
        content: TextPreviewer,
    },
];

export default function ExportObjectsButton(props: ExportButtonProps) {
    return (
        <ExportButton<ContextItemExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportObjectsStore}
            onShowing={useExportObjectsStore.getState().resetResult}
            onShown={useExportObjectsStore.getState().triggerResultComputation}
            onHiding={useExportObjectsStore.getState().resetResult} />
    );
}