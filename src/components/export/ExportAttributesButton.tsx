import useExportAttributesStore from "../../stores/export/useExportAttributesStore";
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

export default function ExportAttributesButton(props: ExportButtonProps) {
    return (
        <ExportButton<ContextItemExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportAttributesStore}
            onShowing={useExportAttributesStore.getState().resetResult}
            onShown={useExportAttributesStore.getState().triggerResultComputation} />
    );
}