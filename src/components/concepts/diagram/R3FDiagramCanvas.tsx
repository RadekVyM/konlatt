import { Canvas, useThree } from "@react-three/fiber";
import useDiagramStore from "../../../stores/useDiagramStore";
import { useContext, useEffect, useRef } from "react";
import { CameraControls, CameraControlsImpl, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import Nodes from "./Nodes";
import { AdaptiveDpr } from "./AdaptiveDpr";
import Links from "./Links";
import NodesToMove from "./NodesToMove";
import { ZoomActionsContext } from "../../../contexts/ZoomActionsContext";
import { transformedPoint } from "./utils";
import { createPoint } from "../../../types/Point";

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

const MOUSEBUTTONS_3D = {
    left: ACTION.ROTATE,
    middle: ACTION.NONE,
    right: ACTION.TRUCK,
    wheel: ACTION.DOLLY,
} as const;

const TOUCHES_3D = {
    one: ACTION.TOUCH_ROTATE,
    two: ACTION.TOUCH_DOLLY_TRUCK,
    three: ACTION.TOUCH_DOLLY,
} as const;

export default function DiagramCanvas() {
    return (
        <Canvas
            frameloop="demand"
            dpr={[Math.min(0.25, window.devicePixelRatio), window.devicePixelRatio]}
            performance={{
                min: 0.25,
            }}>
            <CameraController />

            <EventsController />

            {/* https://github.com/pmndrs/drei/issues/2052 */}
            <AdaptiveDpr />

            <Content />
        </Canvas>
    );
}

function CameraController() {
    const cameraControlsRef = useRef<CameraControlsImpl>(null);
    const layoutId = useDiagramStore((state) => state.layoutId);
    const cameraControlsEnabled = useDiagramStore((state) => state.cameraControlsEnabled);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const orthoCameraKey = `${layoutId}-ortho`;
    const perspectiveCameraKey = `${layoutId}-perspective`;
    const defaultZoom = 25;
    const defaultDistance = cameraType === "2d" ? 10 : 32;

    const cameraControlsEvents = useCameraControlsEvents(cameraControlsRef, defaultDistance, defaultZoom);

    useZoomActionsSetup(cameraControlsRef, defaultDistance);

    return (
        <>
            {cameraType === "2d" ?
                <OrthographicCamera
                    key={orthoCameraKey}
                    makeDefault
                    position={[0, 0, defaultDistance]}
                    far={1200}
                    near={0.1}
                    zoom={defaultZoom} /> :
                <PerspectiveCamera
                    key={perspectiveCameraKey}
                    makeDefault
                    fov={60}
                    far={1200}
                    near={0.1}
                    position={[0, 0, defaultDistance]} />}

            <CameraControls
                ref={cameraControlsRef}
                key={cameraType}
                enabled={cameraControlsEnabled}
                mouseButtons={cameraType === "2d" ? MOUSEBUTTONS_2D : MOUSEBUTTONS_3D}
                touches={cameraType === "2d" ? TOUCHES_2D : TOUCHES_3D}
                dollyToCursor={cameraType === "2d"}
                draggingSmoothTime={0}
                truckSpeed={1}
                {...cameraControlsEvents} />
        </>
    )
}

function Content() {
    const layoutId = useDiagramStore((state) => state.layoutId);
    const semitransparentLinksEnabled = useDiagramStore((state) => state.semitransparentLinksEnabled);

    return (
        <>
            <ambientLight intensity={1} />

            <Links
                key={`${semitransparentLinksEnabled}-links`} />

            <Nodes
                key={`${layoutId}-nodes`} />
            
            <NodesToMove
                key={`${layoutId}-nodes-to-move`} />
        </>
    );
}

function EventsController() {
    const setEvents = useThree((state) => state.setEvents);
    const eventsEnabled = useDiagramStore((state) => state.eventsEnabled);

    useEffect(() => setEvents({ enabled: eventsEnabled }), [eventsEnabled]);

    return undefined;
}

function useCameraControlsEvents(
    cameraControlsRef: React.RefObject<CameraControlsImpl | null>,
    defaultDistance: number,
    defaultZoom: number,
) {
    const timeoutRef = useRef<number | null>(null);
    const regress = useThree((state) => state.performance.regress);
    const camera = useThree((state) => state.camera);

    function onWake() {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        // Pointer events need to be disabled while camera moves
        // because they trigger expensive computations (raycasting)
        // that cause lags 
        useDiagramStore.getState().setIsCameraMoving(true);
    }

    function onSleep() {
        timeoutRef.current = setTimeout(() => useDiagramStore.getState().setIsCameraMoving(false), 500);
    }

    function onUpdate() {
        const state = useDiagramStore.getState();

        // https://r3f.docs.pmnd.rs/advanced/scaling-performance#movement-regression
        if (state.movementRegressionEnabled) {
            regress();
        }

        const distance = cameraControlsRef?.current?.distance || defaultDistance;
        const zoom = camera.zoom;

        if (state.cameraType === "2d") {
            state.setCurrentZoomLevel(zoom / defaultZoom);
        }
        else {
            state.setCurrentZoomLevel(1 / (distance / defaultDistance));
        }
    }

    return {
        onWake,
        onSleep,
        onUpdate,
    };
}

function useZoomActionsSetup(
    cameraControlsRef: React.RefObject<CameraControlsImpl | null>,
    defaultDistance: number,
) {
    const zoomActionsRef = useContext(ZoomActionsContext);

    zoomActionsRef.current = {
        zoomToConcept,
        zoomBy,
        reset: resetCamera,
    };

    function zoomToConcept(conceptIndex: number) {
        const state = useDiagramStore.getState();
        const layout = state.layout;
        const diagramOffsets = state.diagramOffsets;
        const cameraType = state.cameraType;
        const conceptToLayoutIndexesMapping = state.conceptToLayoutIndexesMapping;
        const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex);

        if (!layout || !diagramOffsets || layoutIndex === undefined) {
            return;
        }

        const point = layout[layoutIndex];
        const offset = diagramOffsets[layoutIndex];

        const lookAtPoint = transformedPoint(createPoint(point.x, point.y, point.z), offset, [0, 0, 0], cameraType);
        const distance = defaultDistance + lookAtPoint[2];

        cameraControlsRef.current?.setLookAt(lookAtPoint[0], lookAtPoint[1], distance, lookAtPoint[0], lookAtPoint[1], lookAtPoint[2], true);

        if (cameraType === "2d") {
            cameraControlsRef.current?.zoomTo(150, true);
        }
        else {
            cameraControlsRef.current?.dollyTo(6, true);
        }
    }

    function zoomBy(scale: number) {
        const state = useDiagramStore.getState();
        const cameraType = state.cameraType;

        if (cameraType === "2d") {
            cameraControlsRef.current?.zoom(scale * 100, true);
        }
        else {
            cameraControlsRef.current?.dolly(20 * scale, true);
        }
    }

    function resetCamera() {
        cameraControlsRef.current?.setLookAt(0, 0, defaultDistance, 0, 0, 0, true);

        if (useDiagramStore.getState().cameraType === "2d") {
            cameraControlsRef.current?.zoomTo(25, true);
        }
    }
}