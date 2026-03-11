import createZoomActionsContext from "./createZoomActionsContext";

const {
    ZoomActionsContext,
    ZoomActionsContextProvider,
} = createZoomActionsContext();

/**
 * Context object for accessing diagram zoom actions.
 */
export const DiagramZoomActionsContext = ZoomActionsContext;
/**
 * Provider component that wraps the diagram area to manage zoom state.
 */
export const DiagramZoomActionsContextProvider = ZoomActionsContextProvider;