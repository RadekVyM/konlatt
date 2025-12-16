import { LuCheck, LuCopy } from "react-icons/lu";
import useCopySuccessful from "../../../hooks/useCopySuccesful";
import useExportDiagramStore from "../../../stores/export/diagram/useExportDiagramStore";
import { downloadBlob } from "../../../utils/export";
import toast from "../../toast";
import DownloadButtons from "../DownloadButtons";
import { CANVAS_ID } from "../../../constants/diagramExport";
import { DiagramExportFormat } from "../../../types/export/DiagramExportFormat";

export default function RasterDownloadButtons(props: {
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