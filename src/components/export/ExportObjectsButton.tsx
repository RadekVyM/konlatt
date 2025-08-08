import useExportObjectsStore from "../../stores/export/useExportObjectsStore";
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

export default function ExportObjectsButton(props: ExportButtonProps) {
    return (
        <ExportButton<ContextItemExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportObjectsStore}
            onShowing={useExportObjectsStore.getState().resetResult}
            onShown={useExportObjectsStore.getState().triggerResultComputation} />
    );
}