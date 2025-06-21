import { Canvas, useThree } from "@react-three/fiber";
import useDiagramStore from "../../../stores/useDiagramStore";
import { useEffect, useRef } from "react";
import { CameraControls, CameraControlsImpl, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import Nodes from "./Nodes";
import { AdaptiveDpr } from "./AdaptiveDpr";
import Links from "./Links";
import NodesToMove from "./NodesToMove";

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
    right: ACTION.NONE,
    wheel: ACTION.DOLLY,
} as const;

const TOUCHES_3D = {
    one: ACTION.TOUCH_ROTATE,
    two: ACTION.TOUCH_DOLLY,
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
    const layoutId = useDiagramStore((state) => state.layoutId);
    const cameraControlsEnabled = useDiagramStore((state) => state.cameraControlsEnabled);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const orthoCameraKey = `${layoutId}-ortho`;
    const perspectiveCameraKey = `${layoutId}-perspective`;

    const cameraControlsEvents = useCameraControlsEvents();

    return (
        <>
            {cameraType === "2d" ?
                <OrthographicCamera
                    key={orthoCameraKey}
                    makeDefault
                    position={[0, 0, 10]}
                    far={1200}
                    near={0.1}
                    zoom={25} /> :
                <PerspectiveCamera
                    key={perspectiveCameraKey}
                    makeDefault
                    fov={60}
                    far={1200}
                    near={0.1}
                    position={[0, 0, 32]} />}

            <CameraControls
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

function useCameraControlsEvents() {
    const timeoutRef = useRef<number | null>(null);
    const regress = useThree((state) => state.performance.regress);
    const setIsCameraMoving = useDiagramStore((state) => state.setIsCameraMoving);
    const movementRegressionEnabled = useDiagramStore((state) => state.movementRegressionEnabled);

    function onWake() {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        // Pointer events need to be disabled while camera moves
        // because they trigger expensive computations (raycasting)
        // that cause lags 
        setIsCameraMoving(true);
    }

    function onSleep() {
        timeoutRef.current = setTimeout(() => setIsCameraMoving(false), 500);
    }

    function onUpdate() {
        // https://r3f.docs.pmnd.rs/advanced/scaling-performance#movement-regression
        if (movementRegressionEnabled) {
            regress();
        }
    }

    return {
        onWake,
        onSleep,
        onUpdate,
    };
}