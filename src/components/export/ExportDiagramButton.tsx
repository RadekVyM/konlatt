import useDiagramStore from "../../stores/diagram/useDiagramStore";
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
        buttons: () => <></>,
    },
];

export default function ExportDiagramButton(props: ExportButtonProps) {
    const layout = useDiagramStore((state) => state.layout);

    return (
        <ExportButton<DiagramExportFormat>
            {...props}
            disabled={!layout}
            items={ITEMS}
            isHighlighted
            useSelectedFormatStore={useExportDiagramStore} />
    );
}