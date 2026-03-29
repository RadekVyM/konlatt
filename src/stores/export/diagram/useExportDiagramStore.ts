import { create } from "zustand";
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
import ExportDiagramWorker from "../../../workers/ExportDiagramWorker?worker";
import { ExportDiagramWorkerResponse } from "../../../types/workers/ExportDiagramWorkerResponse";
import toast from "../../../components/toast";
import withTooLarge from "./withTooLarge";

type ExportDiagramStoreState = {
    transformedLayout: ReadonlyArray<Point> | null,
    links: ReadonlyArray<Link> | null,
    canvasDimensions: CanvasDimensions | null,
    maxWidth: number,
    maxHeight: number,
    minPaddingLeft: number,
    minPaddingRight: number,
    minPaddingTop: number,
    minPaddingBottom: number,
    /** Stores the ratio to maintain when maxDimensionsLockedAspecRatio is active */
    lockedAspectRatio: { width: number, height: number } | null,
    maxDimensionsLockedAspecRatio: boolean,
    backgroundColor: HsvaColor,
    defaultNodeColor: HsvaColor,
    defaultLinkColor: HsvaColor,
    nodeRadius: number,
    linkThickness: number,
    /** Tracks if the first render of the preview worker has finished */
    isInitialPreviewCanvasDrawDone: boolean,
    isExporting: boolean,
    /** Dedicated worker for handling heavy canvas drawing operations */
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
    /** Sets dimensions based on orientation (landscape vs portrait) */
    setDimensions: (largerSize: number, smallerSize: number) => void,
    setIsInitialPreviewCanvasDrawDone: (isInitialPreviewCanvasDrawDone: boolean) => void,
    setIsExporting: (isExporting: boolean) => void,
    /** Should be triggered when the export dialog is fully visible */
    onDialogShown: () => void,
    /** Initializes the worker and state when the dialog starts appearing */
    onDialogShowing: () => void,
    /** Cleans up workers and state when the dialog is dismissed */
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

/**
 * Store that manages the export state and logic for the concept lattice diagram.
 * Handles dimension calculations, padding, color schemes, and offscreen canvas rendering via workers.
 */
const useExportDiagramStore = create<ExportDiagramStore>((set) => ({
    ...initialState,
    ...labelsSliceInitialState,
    ...createDiagramOptionsSlice(set),
    setMaxWidth: (maxWidth) => set((old) => {
        maxWidth = Math.max(maxWidth, 0);

        if (!old.lockedAspectRatio || old.maxWidth === 0) {
            return w({ maxWidth }, old, withValidDimensions, withCanvasDimensions, withTextResult);
        }

        // Calculate proportional height based on locked aspect ratio
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

        // Calculate proportional width based on locked aspect ratio
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

        // Assign larger/smaller values based on whether the diagram is landscape or portrait
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
            // Snapshot current dimensions as the reference ratio when locking
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
    onDialogShown: () => set((old) => w({}, old, withTransformedLayout, withLinks, withLabels, withTooLarge, withTextResult)),
    onDialogShowing: () => set((old) => {
        // Ensure any existing worker is killed before starting a new session
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
        withTextResult,
        withTooLarge),
}));

export default useExportDiagramStore;

/**
 * Message handler for the background worker to update the store state.
 */
function handleWorkerResponse(event: MessageEvent<ExportDiagramWorkerResponse>) {
    switch (event.data.type) {
        case "draw-done":
            useExportDiagramStore.getState().setIsInitialPreviewCanvasDrawDone(true);
            break;
    }
}