import { create } from "zustand";

type DiagramConfigPanelDimensionsStore = {
    rect: DOMRectReadOnly,
    setRect: (rect: DOMRectReadOnly) => void,
}

/**
 * Store that manages the dimensions and positioning of the diagram configuration panel.
 */
const useDiagramConfigPanelDimensionsStore = create<DiagramConfigPanelDimensionsStore>((set) => ({
    rect: new DOMRect(),
    setRect: (rect) => set(() => ({ rect })),
}));

export default useDiagramConfigPanelDimensionsStore;