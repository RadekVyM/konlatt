import useExportContextStore from "../../stores/export/useExportContextStore";
import { ContextExportFormat } from "../../types/export/ContextExportFormat";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const ITEMS: Array<ExportItem<ContextExportFormat>> = [
    {
        key: "burmeister",
        label: "Burmeister",
        content: () => <>Burmeister</>,
    },
    {
        key: "json",
        label: "JSON",
        content: () => <>JSON</>,
    },
    {
        key: "xml",
        label: "XML",
        content: () => <>XML</>,
    },
    {
        key: "csv",
        label: "CSV",
        content: () => <>CSV</>,
    },
];

export default function ExportContextButton(props: ExportButtonProps) {
    return (
        <ExportButton<ContextExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportContextStore}
            onShowing={useExportContextStore.getState().resetResult}
            onShown={useExportContextStore.getState().triggerResultComputation} />
    );
}