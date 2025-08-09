import useExportContextStore from "../../stores/export/useExportContextStore";
import { ContextExportFormat } from "../../types/export/ContextExportFormat";
import TextPreviewer from "../TextPreviewer";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const ITEMS: Array<ExportItem<ContextExportFormat>> = [
    {
        key: "burmeister",
        label: "Burmeister",
        content: TextResult,
    },
    {
        key: "json",
        label: "JSON",
        content: TextResult,
    },
    {
        key: "xml",
        label: "XML",
        content: TextResult
    },
    {
        key: "csv",
        label: "CSV",
        content: TextResult,
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

function TextResult() {
    const result = useExportContextStore((state) => state.result);
    const selectedFormat = useExportContextStore((state) => state.selectedFormat);

    return (
        <TextPreviewer
            key={selectedFormat}
            lines={result || []}
            className="w-full h-full" />
    );
}