import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import useExportDiagramStore from "../../../stores/export/diagram/useExportDiagramStore";
import { DiagramExportFormat } from "../../../types/export/DiagramExportFormat";
import ExportButton from "../ExportButton";
import ExportDiagramCanvas from "./ExportDiagramCanvas";
import { ExportButtonProps } from "../types/ExportButtonProps";
import { ExportItem } from "../types/ExportItem";
import "./aspect-ratio-bridge-clip.css";
import PictureOptions from "./PictureOptions";
import createDownloadButtonsComponent from "../createDownloadButtonsComponent";
import { CANVAS_ID } from "../../../constants/diagramExport";
import createTextResultPreviewerComponent from "../createTextResultPreviewerComponent";
import RasterDownloadButtons from "./RasterDownloadButtons";
import ConfigSection from "../../layouts/ConfigSection";
import LabelLineInputs from "./LabelLineInputs";

const TextPreviewer = createTextResultPreviewerComponent(useExportDiagramStore);

const SvgDownloadButtons = createDownloadButtonsComponent(useExportDiagramStore, "exported-diagram.svg");

const TikzDownloadButtons = createDownloadButtonsComponent(useExportDiagramStore, "exported-diagram.tex", "\n", true);

const ITEMS: Array<ExportItem<DiagramExportFormat>> = [
    {
        key: "png",
        label: "PNG",
        content: RasterContent,
        buttons: () => <RasterDownloadButtons fileName="exported-diagram.png" />,
        options: () => <PictureOptions />
    },
    {
        key: "jpg",
        label: "JPEG",
        content: RasterContent,
        buttons: () => <RasterDownloadButtons fileName="exported-diagram.jpg" />,
        options: () => <PictureOptions />
    },
    {
        key: "svg",
        label: "SVG",
        content: () => <TextPreviewer />,
        buttons: () => <SvgDownloadButtons />,
        options: () => <PictureOptions />
    },
    {
        key: "tikz",
        label: "TikZ",
        content: () => <TextPreviewer />,
        buttons: () => <TikzDownloadButtons />,
        options: () => <TikzOptions />
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
            useSelectedFormatStore={useExportDiagramStore}
            onShowing={useExportDiagramStore.getState().resetResult}
            onShown={() => {
                useExportDiagramStore.getState().onDialogShown();
                useExportDiagramStore.getState().triggerResultComputation();
            }}
            onHiding={useExportDiagramStore.getState().resetResult} />
    );
}

function RasterContent() {
    return (
        <ExportDiagramCanvas
            id={CANVAS_ID} />
    );
}

function TikzOptions() {
    return (
        <ConfigSection
            heading="Labels"
            className="mx-4">
            <LabelLineInputs />
        </ConfigSection>
    );
}