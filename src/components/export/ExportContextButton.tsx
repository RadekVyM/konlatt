import useExportContextStore from "../../stores/export/useExportContextStore";
import { ContextExportFormat } from "../../types/export/ContextExportFormat";
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
    },
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

export default function ExportContextButton(props: ExportButtonProps) {
    return (
        <ExportButton<ContextExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportContextStore}
            onShowing={useExportContextStore.getState().resetResult}
            onShown={useExportContextStore.getState().triggerResultComputation}
            onHiding={useExportContextStore.getState().resetResult} />
    );
}