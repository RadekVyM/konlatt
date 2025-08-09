import useExportObjectsStore from "../../stores/export/useExportObjectsStore";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import TextPreviewer from "../TextPreviewer";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const ITEMS: Array<ExportItem<ContextItemExportFormat>> = [
    {
        key: "json",
        label: "JSON",
        content: TextResult,
    },
    {
        key: "xml",
        label: "XML",
        content: TextResult,
    },
    {
        key: "csv",
        label: "CSV",
        content: TextResult,
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

function TextResult() {
    const result = useExportObjectsStore((state) => state.result);
    const selectedFormat = useExportObjectsStore((state) => state.selectedFormat);

    return (
        <TextPreviewer
            key={selectedFormat}
            lines={result || []}
            className="w-full h-full" />
    );
}