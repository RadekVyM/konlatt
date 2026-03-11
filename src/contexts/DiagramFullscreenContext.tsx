import { createContext } from "react";
import { FullscreenState } from "../types/FullscreenState";

type DiagramFullscreenState = {
    fullscreenState: FullscreenState,
    conceptsPanelEnabled: boolean,
    configPanelEnabled: boolean,
    setConceptsPanelEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setConfigPanelEnabled: React.Dispatch<React.SetStateAction<boolean>>,
}

/**
 * Context for managing UI layout states when the diagram enters fullscreen mode.
 */
export const DiagramFullscreenContext = createContext<DiagramFullscreenState>(null!);

/**
 * Provider component that wraps the diagram interface to supply UI layout and fullscreen state.
 */
export function DiagramFullscreenContextProvider(props: {
    children: React.ReactNode,
    value: DiagramFullscreenState,
}) {
    return (
        <DiagramFullscreenContext.Provider value={props.value}>
            {props.children}
        </DiagramFullscreenContext.Provider>
    );
}