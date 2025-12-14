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
import createTextResultPreviewerComponent from "../createTextResultPreviewerComponent";
import { downloadBlob } from "../../../utils/export";
import useCopySuccessful from "../../../hooks/useCopySuccesful";
import toast from "../../toast";

const TextPreviewer = createTextResultPreviewerComponent(useExportDiagramStore);

const SvgDownloadButtons = createDownloadButtonsComponent(useExportDiagramStore, "exported-diagram.svg");

const TikzDownloadButtons = createDownloadButtonsComponent(useExportDiagramStore, "exported-diagram.tikz", "\n");

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
            onShown={useExportDiagramStore.getState().triggerResultComputation}
            onHiding={useExportDiagramStore.getState().resetResult} />
    );
}

function RasterContent() {
    return (
        <ExportDiagramCanvas
            id={CANVAS_ID} />
    );
}

function RasterDownloadButtons(props: {
    fileName: string,
}) {
    const [copySuccessful, setCopySuccessful] = useCopySuccessful();
    const selectedFormat = useExportDiagramStore((state) => state.selectedFormat);
    const type = selectedFormatToMimeType(selectedFormat);

    async function onCopyClick() {
        setCopySuccessful(false);

        // Clipboard support of "image/jpeg" is poor
        const blob = await getCanvasImageBlob("image/png");

        if (!blob) {
            toast("Failed to generate the image.");
            setCopySuccessful(false);
            return;
        }

        try {
            const item = new ClipboardItem({
                [blob.type]: blob,
            });

            await navigator.clipboard.write([item]);

            setCopySuccessful(true);
        }
        catch (error) {
            toast("Failed to copy the image to clipboard.");
            console.error("Failed to copy image to clipboard:", error);
        }
    }

    async function onDownloadClick() {
        const blob = await getCanvasImageBlob(type);

        if (!blob) {
            toast("Failed to generate the image.");
            return;
        }

        downloadBlob(blob, props.fileName);
    }

    return (
        <div
            className="grid grid-cols-2 gap-x-2 px-4 pb-4">
            <DownloadButtons
                onCopyClick={onCopyClick}
                copyButtonIcon={copySuccessful ? LuCheck : LuCopy}
                onDownloadClick={onDownloadClick} />
        </div>
    )
}

async function getCanvasImageBlob(type: string): Promise<Blob | null> {
    const canvas = document.querySelector<HTMLCanvasElement>(`#${CANVAS_ID}`);

    if (!canvas) {
        return null;
    }

    return await new Promise((resolve) => canvas.toBlob(resolve, type));
}

function selectedFormatToMimeType(selectedFormat: DiagramExportFormat) {
    switch (selectedFormat) {
        case "jpg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "svg":
            return "image/svg+xml";
        case "tikz":
            return "text/plain";
    }
}