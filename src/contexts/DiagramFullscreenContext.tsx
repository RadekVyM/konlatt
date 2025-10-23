import { createContext } from "react";
import { FullscreenState } from "../types/FullscreenState";

type DiagramFullscreenState = {
    fullscreenState: FullscreenState,
    conceptsPanelEnabled: boolean,
    configPanelEnabled: boolean,
    setConceptsPanelEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setConfigPanelEnabled: React.Dispatch<React.SetStateAction<boolean>>,
}

export const DiagramFullscreenContext = createContext<DiagramFullscreenState>(null!);

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