import { CameraControls, CameraControlsImpl, OrthographicCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useContext, useRef } from "react";
import useExplorerStore from "../../../stores/explorer/useExplorerStore";
import { ExplorerZoomActionsContext } from "../../../contexts/ExplorerZoomActionsContext";

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
    const defaultZoom = 100;
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
        cameraControlsRef.current?.setLookAt(0, 0, defaultDistance, 0, 0, 0, true);
        await cameraControlsRef.current?.zoomTo(defaultZoom, true);
    }
}