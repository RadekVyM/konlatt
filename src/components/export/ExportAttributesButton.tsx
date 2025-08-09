import useExportAttributesStore from "../../stores/export/useExportAttributesStore";
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

function TextResult() {
    const result = useExportAttributesStore((state) => state.result);
    const selectedFormat = useExportAttributesStore((state) => state.selectedFormat);

    return (
        <TextPreviewer
            key={selectedFormat}
            lines={result || []}
            className="w-full h-full" />
    );
}