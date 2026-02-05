import { create } from "zustand";
import createSelectedFormatSlice from "../createSelectedFormatSlice";
import { DiagramExportFormat } from "../../../types/export/DiagramExportFormat";
import { createHsvaColor, HsvaColor } from "../../../types/HsvaColor";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "../createTextResultStoreBaseSlice";
import { layoutRect } from "../../../utils/layout";
import withValidDimensions from "./withValidDimensions";
import withLabels from "./withLabels";
import createDiagramOptionsSlice, { LabelsSlice, initialState as labelsSliceInitialState } from "./createLabelsSlice";
import withPositionedLabelGroups from "./withPositionedLabelGroups";
import { Point } from "../../../types/Point";
import { w } from "../../../utils/stores";
import withTransformedLayout from "./withTransformedLayout";
import { CanvasDimensions } from "../../../types/export/CanvasDimensions";
import withCanvasDimensions from "./withCanvasDimensions";
import withTextResult from "./withTextResult";
import { Link } from "../../../types/Link";
import withLinks from "./withLinks";
import ExportDiagramWorker from "../../../workers/exportDiagramWorker?worker";
import { ExportDiagramWorkerResponse } from "../../../types/workers/ExportDiagramWorkerResponse";
import toast from "../../../components/toast";

type ExportDiagramStoreState = {
    transformedLayout: Array<Point> | null,
    links: Array<Link> | null,
    canvasDimensions: CanvasDimensions | null,
    maxWidth: number,
    maxHeight: number,
    minPaddingLeft: number,
    minPaddingRight: number,
    minPaddingTop: number,
    minPaddingBottom: number,
    lockedAspectRatio: { width: number, height: number } | null,
    maxDimensionsLockedAspecRatio: boolean,
    backgroundColor: HsvaColor,
    defaultNodeColor: HsvaColor,
    defaultLinkColor: HsvaColor,
    nodeRadius: number,
    linkThickness: number,
    isInitialPreviewCanvasDrawDone: boolean,
    isExporting: boolean,
    worker: Worker | null,
}

type ExportDiagramStoreActions = {
    setMaxWidth: (rasterWidth: number) => void,
    setMaxHeight: (rasterHeight: number) => void,
    setMinPaddingLeft: (minPaddingLeft: number) => void,
    setMinPaddingRight: (minPaddingRight: number) => void,
    setMinPaddingTop: (minPaddingTop: number) => void,
    setMinPaddingBottom: (minPaddingBottom: number) => void,
    setMaxDimensionsLockedAspecRatio: React.Dispatch<React.SetStateAction<boolean>>,
    setBackgroundColor: (backgroundColor: HsvaColor) => void,
    setDefaultNodeColor: (defaultNodeColor: HsvaColor) => void,
    setDefaultLinkColor: (defaultLinkColor: HsvaColor) => void,
    setNodeRadius: (nodeRadius: number) => void,
    setLinkThickness: (linkThickness: number) => void,
    setDimensions: (largerSize: number, smallerSize: number) => void,
    setIsInitialPreviewCanvasDrawDone: (isInitialPreviewCanvasDrawDone: boolean) => void,
    setIsExporting: (isExporting: boolean) => void,
    onDialogShown: () => void,
    onDialogShowing: () => void,
    onDialogHiding: () => void,
    reset: () => void,
}

export type ExportDiagramStore = TextResultExportStore<DiagramExportFormat> & ExportDiagramStoreState & ExportDiagramStoreActions & LabelsSlice

const initialState: ExportDiagramStoreState = {
    transformedLayout: null,
    links: null,
    canvasDimensions: null,
    maxWidth: 1280,
    maxHeight: 1280,
    minPaddingLeft: 0,
    minPaddingRight: 0,
    minPaddingTop: 0,
    minPaddingBottom: 0,
    nodeRadius: 8,
    linkThickness: 2,
    lockedAspectRatio: null,
    maxDimensionsLockedAspecRatio: false,
    backgroundColor: createHsvaColor(0, 0, 1, 0),
    defaultNodeColor: createHsvaColor(0, 0, 0, 1),
    defaultLinkColor: createHsvaColor(0, 0, 0.7, 1),
    isInitialPreviewCanvasDrawDone: false,
    isExporting: false,
    worker: null,
};

const useExportDiagramStore = create<ExportDiagramStore>((set) => ({
    ...initialState,
    ...labelsSliceInitialState,
    ...createDiagramOptionsSlice(set),
    ...createSelectedFormatSlice<DiagramExportFormat, ExportDiagramStore>("svg", set),
    setMaxWidth: (maxWidth) => set((old) => {
        maxWidth = Math.max(maxWidth, 0);

        if (!old.lockedAspectRatio || old.maxWidth === 0) {
            return w({ maxWidth }, old, withValidDimensions, withCanvasDimensions, withTextResult);
        }

        const aspectRatio = old.lockedAspectRatio.height / old.lockedAspectRatio.width;

        return w({
            maxWidth,
            maxHeight: Math.round(aspectRatio * maxWidth),
        }, old, withValidDimensions, withCanvasDimensions, withTextResult);
    }),
    setMaxHeight: (maxHeight) => set((old) => {
        maxHeight = Math.max(maxHeight, 0);

        if (!old.lockedAspectRatio || old.maxHeight === 0) {
            return w({ maxHeight }, old, withValidDimensions, withCanvasDimensions, withTextResult);
        }

        const aspectRatio = old.lockedAspectRatio.width / old.lockedAspectRatio.height;

        return w({
            maxHeight,
            maxWidth: Math.round(aspectRatio * maxHeight),
        }, old, withValidDimensions, withCanvasDimensions, withTextResult);
    }),
    setDimensions: (largerSize, smallerSize) => set((old) => {
        largerSize = Math.max(largerSize, 0);
        smallerSize = Math.max(smallerSize, 0);

        if (!old.transformedLayout) {
            return w({}, old, withCanvasDimensions, withTextResult);
        }

        const { width, height } = layoutRect(old.transformedLayout);

        return w({
            maxWidth: width > height ? largerSize : smallerSize,
            maxHeight: width > height ? smallerSize : largerSize,
        }, old, withCanvasDimensions, withTextResult);
    }),
    setMinPaddingLeft: (minPaddingLeft) => set((old) => w({ minPaddingLeft: Math.max(minPaddingLeft, 0) }, old, withCanvasDimensions, withTextResult)),
    setMinPaddingRight: (minPaddingRight) => set((old) => w({ minPaddingRight: Math.max(minPaddingRight, 0) }, old, withCanvasDimensions, withTextResult)),
    setMinPaddingTop: (minPaddingTop) => set((old) => w({ minPaddingTop: Math.max(minPaddingTop, 0) }, old, withCanvasDimensions, withTextResult)),
    setMinPaddingBottom: (minPaddingBottom) => set((old) => w({ minPaddingBottom: Math.max(minPaddingBottom, 0) }, old, withCanvasDimensions, withTextResult)),
    setMaxDimensionsLockedAspecRatio: (maxDimensionsLockedAspecRatio) => set((old) => {
        const value = (typeof maxDimensionsLockedAspecRatio === "function" ?
            maxDimensionsLockedAspecRatio(old.maxDimensionsLockedAspecRatio) :
            maxDimensionsLockedAspecRatio);

        return {
            lockedAspectRatio: value ? { width: old.maxWidth, height: old.maxHeight } : null,
            maxDimensionsLockedAspecRatio: value,
        };
    }),
    setBackgroundColor: (backgroundColor) => set((old) => w({ backgroundColor }, old, withTextResult)),
    setDefaultNodeColor: (defaultNodeColor) => set((old) => w({ defaultNodeColor }, old, withTextResult)),
    setDefaultLinkColor: (defaultLinkColor) => set((old) => w({ defaultLinkColor }, old, withTextResult)),
    setNodeRadius: (nodeRadius) => set((old) => w({ nodeRadius }, old, withPositionedLabelGroups, withTextResult)),
    setLinkThickness: (linkThickness) => set((old) => w({ linkThickness }, old, withTextResult)),
    setIsInitialPreviewCanvasDrawDone: (isInitialPreviewCanvasDrawDone) => set({ isInitialPreviewCanvasDrawDone }),
    setIsExporting: (isExporting) => set({ isExporting }),
    onDialogShown: () => set((old) => w({}, old, withTransformedLayout, withLinks, withLabels, withTextResult)),
    onDialogShowing: () => set((old) => {
        old.worker?.terminate();
        const worker = new ExportDiagramWorker();

        worker.addEventListener("message", handleWorkerResponse);
        worker.addEventListener("error", (event) => {
            console.error(event.message);
            toast("Something went wrong while exporting the diagram");
        });

        return { worker, isInitialPreviewCanvasDrawDone: false };
    }),
    onDialogHiding: () => set((old) => {
        old.worker?.terminate();
        return { worker: null };
    }),
    ...createTextResultStoreBaseSlice<DiagramExportFormat, ExportDiagramStore>(
        "png",
        {
            ...initialState, 
            ...labelsSliceInitialState,
        },
        set,
        withTextResult),
}));

export default useExportDiagramStore;

function handleWorkerResponse(event: MessageEvent<ExportDiagramWorkerResponse>) {
    switch (event.data.type) {
        case "draw-done":
            useExportDiagramStore.getState().setIsInitialPreviewCanvasDrawDone(true);
            break;
    }
}