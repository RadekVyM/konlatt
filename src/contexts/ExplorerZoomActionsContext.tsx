import createZoomActionsContext from "./createZoomActionsContext";

const {
    ZoomActionsContext,
    ZoomActionsContextProvider,
} = createZoomActionsContext();

export const ExplorerZoomActionsContext = ZoomActionsContext;
export const ExplorerZoomActionsContextProvider = ZoomActionsContextProvider;