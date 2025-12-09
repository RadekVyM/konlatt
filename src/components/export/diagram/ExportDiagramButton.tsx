import { LuCheck, LuCopy } from "react-icons/lu";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import useExportDiagramStore from "../../../stores/export/useExportDiagramStore";
import { DiagramExportFormat } from "../../../types/export/DiagramExportFormat";
import ExportButton from "../ExportButton";
import ExportDiagramCanvas from "./ExportDiagramCanvas";
import { ExportButtonProps } from "../types/ExportButtonProps";
import { ExportItem } from "../types/ExportItem";
import "./aspect-ratio-bridge-clip.css";
import DownloadButtons from "../DownloadButtons";
import PictureOptions from "./PictureOptions";
import createDownloadButtonsComponent from "../createDownloadButtonsComponent";
import { CANVAS_ID } from "../../../constants/diagramExport";

const ITEMS: Array<ExportItem<DiagramExportFormat>> = [
    {
        key: "png",
        label: "PNG",
        content: RasterContent,
        buttons: () => <RasterDownloadButtons />,
        options: () => <PictureOptions />
    },
    {
        key: "jpg",
        label: "JPEG",
        content: RasterContent,
        buttons: () => <RasterDownloadButtons />,
        options: () => <PictureOptions />
    },
    {
        key: "svg",
        label: "SVG",
        content: () => <p>Hello SVG</p>,
        buttons: () => <SvgDownloadButtons />,
        options: () => <PictureOptions />
    },
    {
        key: "tikz",
        label: "TikZ",
        content: () => <p>Hello TikZ</p>,
        buttons: () => <TikzDownloadButtons />,
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

function RasterContent() {
    return (
        <ExportDiagramCanvas
            id={CANVAS_ID} />
    );
}

const SvgDownloadButtons = createDownloadButtonsComponent(useExportDiagramStore, "exported-diagram.svg");

const TikzDownloadButtons = createDownloadButtonsComponent(useExportDiagramStore, "exported-diagram.tikz");

function RasterDownloadButtons() {
    const copySuccessful = false;

    function onCopyClick() { }

    function onDownloadClick() {
        const canvas = document.querySelector<HTMLCanvasElement>(`#${CANVAS_ID}`);

        if (!canvas) {
            return;
        }
    }

    return (
        <div
            className="grid grid-cols-2 gap-x-2 px-4 pb-4">
            <DownloadButtons
                onCopyClick={onCopyClick}
                copyDisabled
                copyButtonIcon={copySuccessful ? LuCheck : LuCopy}
                onDownloadClick={onDownloadClick} />
        </div>
    )
}