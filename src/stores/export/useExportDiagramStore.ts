import { create } from "zustand";
import createSelectedFormatSlice, { SelectedFormatSlice } from "./createSelectedFormatSlice";
import { DiagramExportFormat } from "../../types/export/DiagramExportFormat";
import { createHsvaColor, HsvaColor } from "../../types/HsvaColor";
import { MAX_CANVAS_AREA, MAX_CANVAS_HEIGHT, MAX_CANVAS_WIDTH } from "../../constants/diagramExport";
import useDiagramStore from "../diagram/useDiagramStore";
import { layoutRect, transformedLayoutForExport } from "../../utils/export";

type ExportDiagramStoreState = {
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
    reset: () => void,
}

type ExportDiagramStore = ExportDiagramStoreState & ExportDiagramStoreActions & SelectedFormatSlice<DiagramExportFormat>

const initialState: ExportDiagramStoreState = {
    maxWidth: 1920,
    maxHeight: 1080,
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
    defaultLinkColor: createHsvaColor(0, 0, 0.5, 1),
};

const useExportDiagramStore = create<ExportDiagramStore>((set) => ({
    ...initialState,
    ...createSelectedFormatSlice<DiagramExportFormat, ExportDiagramStore>("svg", set),
    setMaxWidth: (maxWidth) => set((old) => {
        if (!old.lockedAspectRatio || old.maxWidth === 0) {
            return withValidDimensions({ maxWidth }, old);
        }

        const aspectRatio = old.lockedAspectRatio.height / old.lockedAspectRatio.width;

        return withValidDimensions({
            maxWidth,
            maxHeight: Math.round(aspectRatio * maxWidth),
        }, old);
    }),
    setMaxHeight: (maxHeight) => set((old) => {
        if (!old.lockedAspectRatio || old.maxHeight === 0) {
            return withValidDimensions({ maxHeight }, old);
        }

        const aspectRatio = old.lockedAspectRatio.width / old.lockedAspectRatio.height;

        return withValidDimensions({
            maxHeight,
            maxWidth: Math.round(aspectRatio * maxHeight),
        }, old);
    }),
    setDimensions: (largerSize, smallerSize) => set(() => {
        const diagramStore = useDiagramStore.getState();

        const transformedLayout = transformedLayoutForExport(
            diagramStore.layout,
            diagramStore.diagramOffsets,
            diagramStore.horizontalScale,
            diagramStore.verticalScale,
            diagramStore.rotationDegrees);
        
        if (!transformedLayout) {
            return {};
        }

        const { width, height } = layoutRect(transformedLayout);

        return {
            maxWidth: width > height ? largerSize : smallerSize,
            maxHeight: width > height ? smallerSize : largerSize,
        };
    }),
    setMinPaddingLeft: (minPaddingLeft: number) => set({ minPaddingLeft }),
    setMinPaddingRight: (minPaddingRight: number) => set({ minPaddingRight }),
    setMinPaddingTop: (minPaddingTop: number) => set({ minPaddingTop }),
    setMinPaddingBottom: (minPaddingBottom: number) => set({ minPaddingBottom }),
    setMaxDimensionsLockedAspecRatio: (maxDimensionsLockedAspecRatio) => set((old) => {
        const value = (typeof maxDimensionsLockedAspecRatio === "function" ?
            maxDimensionsLockedAspecRatio(old.maxDimensionsLockedAspecRatio) :
            maxDimensionsLockedAspecRatio);

        return {
            lockedAspectRatio: value ? { width: old.maxWidth, height: old.maxHeight } : null,
            maxDimensionsLockedAspecRatio: value,
        };
    }),
    setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
    setDefaultNodeColor: (defaultNodeColor) => set({ defaultNodeColor }),
    setDefaultLinkColor: (defaultLinkColor) => set({ defaultLinkColor }),
    setNodeRadius: (nodeRadius) => set({ nodeRadius }),
    setLinkThickness: (linkThickness) => set({ linkThickness }),
    reset: () => set(() => ({
        ...initialState,
    })),
}));

export default useExportDiagramStore;

function withValidDimensions(
    newState: Partial<ExportDiagramStore>,
    oldState: ExportDiagramStore,
): Partial<ExportDiagramStore> {
    const maxWidth = newState.maxWidth === undefined ? oldState.maxWidth : newState.maxWidth;
    const maxHeight = newState.maxHeight === undefined ? oldState.maxHeight : newState.maxHeight;

    if (maxWidth > MAX_CANVAS_WIDTH ||
        maxHeight > MAX_CANVAS_HEIGHT) {
        return { ...newState, maxWidth: oldState.maxWidth, maxHeight: oldState.maxHeight };
    }

    if (maxWidth * maxHeight > MAX_CANVAS_AREA) {
        if (maxWidth === maxHeight) {
            const size = Math.floor(Math.sqrt(MAX_CANVAS_AREA));

            return {
                ...newState,
                maxWidth: size,
                maxHeight: size,
            };
        }

        return {
            ...newState,
            maxWidth: maxWidth > maxHeight ? maxWidth : Math.floor(MAX_CANVAS_AREA / maxHeight),
            maxHeight: maxWidth > maxHeight ? Math.floor(MAX_CANVAS_AREA / maxWidth) : maxHeight,
        };
    }

    return newState;
}