import useExportAttributeStore from "../../stores/export/useExportAttributeStore";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const ITEMS: Array<ExportItem<ContextItemExportFormat>> = [
    {
        key: "json",
        label: "JSON",
        content: () => <></>,
    },
    {
        key: "xml",
        label: "XML",
        content: () => <></>,
    },
    {
        key: "csv",
        label: "CSV",
        content: () => <></>,
    },
];

export default function ExportAttributeButton(props: ExportButtonProps) {
    return (
        <ExportButton<ContextItemExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportAttributeStore}
            onShowing={useExportAttributeStore.getState().resetResult}
            onShown={useExportAttributeStore.getState().triggerResultComputation}
            onHiding={useExportAttributeStore.getState().resetResult} />
    );
}