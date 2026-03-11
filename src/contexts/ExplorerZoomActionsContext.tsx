import createZoomActionsContext from "./createZoomActionsContext";

const {
    ZoomActionsContext,
    ZoomActionsContextProvider,
} = createZoomActionsContext();

/**
 * Context object for accessing explorer zoom actions.
 */
export const ExplorerZoomActionsContext = ZoomActionsContext;
/**
 * Provider component that wraps the explorer area to manage zoom state.
 */
export const ExplorerZoomActionsContextProvider = ZoomActionsContextProvider;