import { create } from "zustand";
import createSelectedFormatSlice, { SelectedFormatSlice } from "./createSelectedFormatSlice";
import { DiagramExportFormat } from "../../types/export/DiagramExportFormat";
import { createHsvaColor, HsvaColor } from "../../types/HsvaColor";

type ExportDiagramStoreState = {
    rasterWidth: number,
    rasterHeight: number,
    rasterLockedAspecRatio: boolean,
    backgroundColor: HsvaColor,
    defaultNodeColor: HsvaColor,
    defaultLinkColor: HsvaColor,
    nodeRadius: number,
    linkThickness: number,
}

type ExportDiagramStoreActions = {
    setRasterWidth: (rasterWidth: number) => void,
    setRasterHeight: (rasterHeight: number) => void,
    setRasterLockedAspecRatio: React.Dispatch<React.SetStateAction<boolean>>,
    setBackgroundColor: (backgroundColor: HsvaColor) => void,
    setDefaultNodeColor: (defaultNodeColor: HsvaColor) => void,
    setDefaultLinkColor: (defaultLinkColor: HsvaColor) => void,
    setNodeRadius: (nodeRadius: number) => void,
    setLinkThickness: (linkThickness: number) => void,
    reset: () => void,
}

type ExportDiagramStore = ExportDiagramStoreState & ExportDiagramStoreActions & SelectedFormatSlice<DiagramExportFormat>

const initialState: ExportDiagramStoreState = {
    rasterWidth: 1920,
    rasterHeight: 1080,
    nodeRadius: 8,
    linkThickness: 2,
    rasterLockedAspecRatio: false,
    backgroundColor: createHsvaColor(0, 0, 1, 0),
    defaultNodeColor: createHsvaColor(0, 0, 0, 1),
    defaultLinkColor: createHsvaColor(0, 0, 0.5, 1),
};

const useExportDiagramStore = create<ExportDiagramStore>((set) => ({
    ...initialState,
    ...createSelectedFormatSlice<DiagramExportFormat, ExportDiagramStore>("svg", set),
    setRasterWidth: (rasterWidth) => set((old) => {
        if (!old.rasterLockedAspecRatio || old.rasterWidth === 0) {
            return ({ rasterWidth });
        }

        const aspectRatio = old.rasterHeight / old.rasterWidth;

        return {
            rasterWidth,
            rasterHeight: Math.round(aspectRatio * rasterWidth),
        };
    }),
    setRasterHeight: (rasterHeight) => set((old) => {
        if (!old.rasterLockedAspecRatio || old.rasterHeight === 0) {
            return ({ rasterHeight });
        }

        const aspectRatio = old.rasterWidth / old.rasterHeight;

        return {
            rasterHeight,
            rasterWidth: Math.round(aspectRatio * rasterHeight),
        };
    }),
    setRasterLockedAspecRatio: (rasterLockedAspecRatio) => set((old) => ({
        rasterLockedAspecRatio: (typeof rasterLockedAspecRatio === "function" ?
            rasterLockedAspecRatio(old.rasterLockedAspecRatio) :
            rasterLockedAspecRatio)
    })),
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