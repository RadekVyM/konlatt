import useExportAttributeStore from "../../stores/export/useExportAttributeStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createDownloadButtonsComponent from "./createDownloadButtonsComponent";
import createTextResultPreviewerComponent from "./createTextResultPreviewerComponent";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const TextPreviewer = createTextResultPreviewerComponent(useExportAttributeStore);

const ITEMS: Array<ExportItem<ContextItemExportFormat>> = [
    {
        key: "json",
        label: "JSON",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportAttributeStore, "exported-attribute.json"),
    },
    {
        key: "xml",
        label: "XML",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportAttributeStore, "exported-attribute.xml"),
    },
    {
        key: "csv",
        label: "CSV",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportAttributeStore, "exported-attribute.csv", "\n"),
    },
];

export default function ExportAttributeButton(props: ExportButtonProps) {
    const context = useDataStructuresStore((state) => state.context);

    return (
        <ExportButton<ContextItemExportFormat>
            {...props}
            disabled={!context}
            items={ITEMS}
            useSelectedFormatStore={useExportAttributeStore}
            onShowing={useExportAttributeStore.getState().resetResult}
            onShown={useExportAttributeStore.getState().triggerResultComputation}
            onHiding={useExportAttributeStore.getState().resetResult} />
    );
}