import { LuCheck, LuCopy } from "react-icons/lu";
import useCopySuccessful from "../../../hooks/useCopySuccesful";
import useExportDiagramStore from "../../../stores/export/diagram/useExportDiagramStore";
import { downloadBlob } from "../../../utils/export";
import toast from "../../toast";
import DownloadButtons from "../DownloadButtons";
import { DiagramExportFormat } from "../../../types/export/DiagramExportFormat";
import { BlobRequest } from "../../../types/workers/ExportDiagramWorkerRequest";
import { BlobResponse } from "../../../types/workers/ExportDiagramWorkerResponse";

export default function RasterDownloadButtons(props: {
    fileName: string,
}) {
    const [copySuccessful, setCopySuccessful] = useCopySuccessful();
    const selectedFormat = useExportDiagramStore((state) => state.selectedFormat);
    const isExporting = useExportDiagramStore((state) => state.isExporting);
    const isInitialPreviewCanvasDrawDone = useExportDiagramStore((state) => state.isInitialPreviewCanvasDrawDone);
    const type = selectedFormatToMimeType(selectedFormat);

    async function onCopyClick() {
        setCopySuccessful(false);
        useExportDiagramStore.getState().setIsExporting(true);

        try {
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
        finally {
            useExportDiagramStore.getState().setIsExporting(false);
        }
    }

    async function onDownloadClick() {
        useExportDiagramStore.getState().setIsExporting(true);

        try {
            const blob = await getCanvasImageBlob(type);

            if (!blob) {
                toast("Failed to generate the image.");
                return;
            }

            downloadBlob(blob, props.fileName);
        }
        finally {
            useExportDiagramStore.getState().setIsExporting(false);
        }
    }

    return (
        <div
            className="grid grid-cols-2 gap-x-2 px-4 pb-4">
            <DownloadButtons
                copyDisabled={isExporting || !isInitialPreviewCanvasDrawDone}
                downloadDisabled={isExporting || !isInitialPreviewCanvasDrawDone}
                onCopyClick={onCopyClick}
                copyButtonIcon={copySuccessful ? LuCheck : LuCopy}
                onDownloadClick={onDownloadClick} />
        </div>
    )
}

async function getCanvasImageBlob(type: string): Promise<Blob | null> {
    const worker = useExportDiagramStore.getState().worker;

    if (!worker) {
        return null;
    }

    return await new Promise((resolve) => {
        const handler = (response: MessageEvent<BlobResponse>) => {
            if (response.data.type !== "blob") {
                return;
            }

            worker.removeEventListener("message", handler);
            resolve(response.data.blob);
        };

        worker.addEventListener("message", handler);

        const message: BlobRequest = {
            type: "blob",
            mimeType: type,
        };
        worker.postMessage(message);
    });
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