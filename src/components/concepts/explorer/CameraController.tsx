import { CameraControls, CameraControlsImpl, OrthographicCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useContext, useRef } from "react";
import useExplorerStore from "../../../stores/explorer/useExplorerStore";
import { ExplorerZoomActionsContext } from "../../../contexts/ExplorerZoomActionsContext";

const IDEAL_EXPLORER_WIDTH = 30;
const IDEAL_EXPLORER_HEIGHT = 24;

const { ACTION } = CameraControlsImpl;

const MOUSEBUTTONS_2D = {
    left: ACTION.TRUCK,
    middle: ACTION.NONE,
    right: ACTION.NONE,
    wheel: ACTION.ZOOM,
} as const;

const TOUCHES_2D = {
    one: ACTION.TOUCH_TRUCK,
    two: ACTION.TOUCH_ZOOM,
    three: ACTION.TOUCH_ZOOM,
} as const;

export default function CameraController() {
    const cameraControlsRef = useRef<CameraControlsImpl>(null);
    const defaultZoom = useDefaultZoom();
    const defaultDistance = 10;

    const cameraControlsEvents = useCameraControlsEvents(defaultZoom);

    useZoomActionsSetup(cameraControlsRef, defaultDistance, defaultZoom);

    return (
        <>
            <OrthographicCamera
                makeDefault
                position={[0, 0, 10]}
                far={1200}
                near={0.1}
                zoom={defaultZoom} />

            <CameraControls
                ref={cameraControlsRef}
                mouseButtons={MOUSEBUTTONS_2D}
                touches={TOUCHES_2D}
                dollyToCursor={true}
                draggingSmoothTime={0}
                truckSpeed={1}
                maxZoom={9999 / (100 / defaultZoom)}
                minDistance={1}
                {...cameraControlsEvents} />
        </>
    );
}

function useDefaultZoom() {
    // Do not expect any super smart calculations
    // Good old rule of three and some made up numbers, that look generally fine, are used
    const minConstantZoom = 25;
    const maxConstantZoom = 100;

    const layoutBox = useExplorerStore((state) => state.layoutBox);

    const idealZoom = layoutBox === null ?
        minConstantZoom :
        Math.min(
            minConstantZoom * (IDEAL_EXPLORER_WIDTH / layoutBox.width),
            minConstantZoom * (IDEAL_EXPLORER_HEIGHT / layoutBox.height));

    const defaultZoom = Math.min(maxConstantZoom, Math.max(minConstantZoom, idealZoom));

    return defaultZoom;
}

function useCameraControlsEvents(
    defaultZoom: number,
) {
    const camera = useThree((state) => state.camera);

    function onUpdate() {
        const zoom = camera.zoom;

        useExplorerStore.getState().setCurrentZoomLevel(zoom / defaultZoom);
    }

    return {
        onUpdate,
    };
}

function useZoomActionsSetup(
    cameraControlsRef: React.RefObject<CameraControlsImpl | null>,
    defaultDistance: number,
    defaultZoom: number,
) {
    const zoomActionsRef = useContext(ExplorerZoomActionsContext);

    zoomActionsRef.current = {
        zoomToConcept,
        zoomBy,
        reset: resetCamera,
    };

    async function zoomToConcept(_conceptIndex: number) {
        // cameraControlsRef.current?.setLookAt(lookAtPoint[0], lookAtPoint[1], distance, lookAtPoint[0], lookAtPoint[1], lookAtPoint[2], true);

        await cameraControlsRef.current?.zoomTo(150, true);
    }

    async function zoomBy(scale: number) {
        await cameraControlsRef.current?.zoom(scale * 100, true);
    }

    async function resetCamera() {
        const y = centerY();
        cameraControlsRef.current?.setLookAt(0, y, defaultDistance, 0, y, 0, true);
        await cameraControlsRef.current?.zoomTo(defaultZoom, true);
    }
}

function centerY() {
    const layoutBox = useExplorerStore.getState().layoutBox;

    if (layoutBox === null) {
        return 0;
    }

    const centerOffset = (layoutBox.height / 2) + layoutBox.y;
    const maxOffset = IDEAL_EXPLORER_HEIGHT / 4;

    return Math.max(-maxOffset, Math.min(maxOffset, centerOffset));
}