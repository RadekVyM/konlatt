import useExportDiagramStore from "../../stores/export/useExportDiagramStore";
import { DiagramExportFormat } from "../../types/export/DiagramExportFormat";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const ITEMS: Array<ExportItem<DiagramExportFormat>> = [
    {
        key: "svg",
        label: "SVG",
        content: () => <></>,
    },
];

export default function ExportDiagramButton(props: ExportButtonProps) {
    return (
        <ExportButton<DiagramExportFormat>
            {...props}
            items={ITEMS}
            useSelectedFormatStore={useExportDiagramStore} />
    );
}