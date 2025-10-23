import { create } from "zustand";

type DiagramConfigPanelDimensionsStore = {
    rect: DOMRectReadOnly,
    setRect: (rect: DOMRectReadOnly) => void,
}

const useDiagramConfigPanelDimensionsStore = create<DiagramConfigPanelDimensionsStore>((set) => ({
    rect: new DOMRect(),
    setRect: (rect) => set(() => ({ rect })),
}));

export default useDiagramConfigPanelDimensionsStore;