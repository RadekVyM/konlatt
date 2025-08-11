import useExportAttributesStore from "../../stores/export/useExportAttributesStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createDownloadButtonsComponent from "./createDownloadButtonsComponent";
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
        buttons: createDownloadButtonsComponent(useExportAttributesStore, "exported-attributes.json"),
    },
    {
        key: "xml",
        label: "XML",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportAttributesStore, "exported-attributes.xml"),
    },
    {
        key: "csv",
        label: "CSV",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportAttributesStore, "exported-attributes.csv", "\n"),
    },
];

export default function ExportAttributesButton(props: ExportButtonProps) {
    const context = useDataStructuresStore((state) => state.context);

    return (
        <ExportButton<ContextItemExportFormat>
            {...props}
            disabled={!context}
            items={ITEMS}
            useSelectedFormatStore={useExportAttributesStore}
            onShowing={useExportAttributesStore.getState().resetResult}
            onShown={useExportAttributesStore.getState().triggerResultComputation}
            onHiding={useExportAttributesStore.getState().resetResult} />
    );
}