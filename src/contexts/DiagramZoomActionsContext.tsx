import createZoomActionsContext from "./createZoomActionsContext";

const {
    ZoomActionsContext,
    ZoomActionsContextProvider,
} = createZoomActionsContext();

export const DiagramZoomActionsContext = ZoomActionsContext;
export const DiagramZoomActionsContextProvider = ZoomActionsContextProvider;