import useExportAttributesStore from "../../stores/export/useExportAttributesStore";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createTextResultPreviewerComponent from "./createTextResultPreviewerComponent";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const TextPreviewer = createTextResultPreviewerComponent(useExportAttributesStore);

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

export default function ExportAttributesButton(props: ExportButtonProps) {
    return (
        <ExportButton<ContextItemExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportAttributesStore}
            onShowing={useExportAttributesStore.getState().resetResult}
            onShown={useExportAttributesStore.getState().triggerResultComputation}
            onHiding={useExportAttributesStore.getState().resetResult} />
    );
}