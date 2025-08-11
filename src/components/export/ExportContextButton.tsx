import useExportContextStore from "../../stores/export/useExportContextStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ContextExportFormat } from "../../types/export/ContextExportFormat";
import createDownloadButtonsComponent from "./createDownloadButtonsComponent";
import createTextResultPreviewerComponent from "./createTextResultPreviewerComponent";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const TextPreviewer = createTextResultPreviewerComponent(useExportContextStore);

const ITEMS: Array<ExportItem<ContextExportFormat>> = [
    {
        key: "burmeister",
        label: "Burmeister",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportContextStore, "exported-context.cxt", "\n"),
    },
    {
        key: "json",
        label: "JSON",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportContextStore, "exported-context.json"),
    },
    {
        key: "xml",
        label: "XML",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportContextStore, "exported-context.xml"),
    },
    {
        key: "csv",
        label: "CSV",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportContextStore, "exported-context.csv", "\n"),
    },
];

export default function ExportContextButton(props: ExportButtonProps) {
    const context = useDataStructuresStore((state) => state.context);

    return (
        <ExportButton<ContextExportFormat>
            {...props}
            disabled={!context}
            items={ITEMS}
            useSelectedFormatStore={useExportContextStore}
            onShowing={useExportContextStore.getState().resetResult}
            onShown={useExportContextStore.getState().triggerResultComputation}
            onHiding={useExportContextStore.getState().resetResult} />
    );
}