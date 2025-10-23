import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { useContext } from "react";
import { DiagramFullscreenContext } from "../../../contexts/DiagramFullscreenContext";
import useIsMd from "../../../hooks/useIsMd";
import useIsXl from "../../../hooks/useIsXl";
import useDiagramConfigPanelDimensionsStore from "../../../stores/diagram/useDiagramConfigPanelDimensionsStore";

const MARGIN_RIGHT = 65;
const MARGIN_BOTTOM = 105;

export default function Gizmo() {
    const cameraType = useDiagramStore((state) => state.cameraType);
    const configPanelRect = useDiagramConfigPanelDimensionsStore((state) => state.rect);
    const fullscreenState = useContext(DiagramFullscreenContext);
    const isMd = useIsMd();
    const isXl = useIsXl();

    const margin: [number, number] = !fullscreenState.fullscreenState.isFullscreen ?
        [MARGIN_RIGHT, MARGIN_BOTTOM] :
        [
            MARGIN_RIGHT + (isXl && fullscreenState.configPanelEnabled ? configPanelRect.width + 24 : 0),
            MARGIN_BOTTOM + (!isMd && fullscreenState.configPanelEnabled ? configPanelRect.height + 30 : 0),
        ];

    return (
        <GizmoHelper
            margin={margin}>
            <GizmoViewport
                visible={cameraType === "3d"}
                disabled
                axisScale={[0.83, 0.035, 0.035]}
                axisHeadScale={0.7} />
        </GizmoHelper>
    );
}