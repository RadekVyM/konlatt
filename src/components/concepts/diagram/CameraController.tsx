import { useThree } from "@react-three/fiber";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { useContext, useRef } from "react";
import { CameraControls, CameraControlsImpl, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { DiagramZoomActionsContext } from "../../../contexts/DiagramZoomActionsContext";
import { createPoint } from "../../../types/Point";
import { transformedPoint } from "../../../utils/layout";

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

export default function CameraController() {
    const cameraControlsRef = useRef<CameraControlsImpl>(null);
    const layoutId = useDiagramStore((state) => state.layoutId);
    const cameraControlsEnabled = useDiagramStore((state) => state.cameraControlsEnabled);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const orthoCameraKey = `${layoutId}-ortho`;
    const perspectiveCameraKey = `${layoutId}-perspective`;
    const { defaultDistance, defaultZoom } = useDefaultZoomAndDistance();

    const cameraControlsEvents = useCameraControlsEvents(cameraControlsRef, defaultDistance, defaultZoom);

    useZoomActionsSetup(cameraControlsRef, defaultDistance, defaultZoom);

    return (
        <>
            {cameraType === "2d" ?
                <OrthographicCamera
                    key={orthoCameraKey}
                    makeDefault
                    position={[0, 0, 10]}
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
                maxZoom={9999 / (100 / defaultZoom)}
                minDistance={1}
                {...cameraControlsEvents} />
        </>
    )
}

function useDefaultZoomAndDistance() {
    // Do not expect any super smart calculations
    // Good old rule of three and some made up numbers, that look generally fine, are used
    const minConstantZoom = 25;
    const maxConstantZoom = 100;
    const minConstantDistance = 8;
    const maxConstantDistance = 32;

    const idealDiagramWidth = 32;
    const idealDiagramHeight = 30;

    const cameraType = useDiagramStore((state) => state.cameraType);
    const defaultLayoutBox = useDiagramStore((state) => state.defaultLayoutBox);

    const idealZoom = defaultLayoutBox === null ?
        minConstantZoom :
        Math.min(
            minConstantZoom * (idealDiagramWidth / defaultLayoutBox.width),
            minConstantZoom * (idealDiagramHeight / defaultLayoutBox.height));

    const idealDistance = defaultLayoutBox === null ?
        maxConstantDistance :
        Math.max(
            maxConstantDistance * (defaultLayoutBox.width / idealDiagramWidth),
            maxConstantDistance * (defaultLayoutBox.height / idealDiagramHeight));

    const defaultZoom = Math.min(maxConstantZoom, Math.max(minConstantZoom, idealZoom));
    const defaultDistance = cameraType === "2d" ?
        10 : // This number is probably not that important
        Math.min(maxConstantDistance, Math.max(minConstantDistance, idealDistance));

    return {
        defaultZoom,
        defaultDistance,
    };
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
    defaultZoom: number,
) {
    const distanceZoomFactor = 20;
    const zoomActionsRef = useContext(DiagramZoomActionsContext);

    zoomActionsRef.current = {
        zoomToConcept,
        zoomBy,
        reset: resetCamera,
    };

    async function zoomToConcept(conceptIndex: number) {
        const state = useDiagramStore.getState();
        const layout = state.layout;
        const diagramOffsets = state.diagramOffsets;
        const cameraType = state.cameraType;
        const horizontalScale = state.horizontalScale;
        const verticalScale = state.verticalScale;
        const rotationDegrees = state.rotationDegrees;
        const conceptToLayoutIndexesMapping = state.conceptToLayoutIndexesMapping;
        const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex);

        if (!layout || !diagramOffsets || layoutIndex === undefined) {
            if (layoutIndex === undefined) {
                console.error(`Layout index should not be ${layoutIndex}`);
            }
            return;
        }

        const point = layout[layoutIndex];
        const offset = diagramOffsets[layoutIndex];

        const lookAtPoint = transformedPoint(createPoint(point.x, point.y, point.z), offset, [0, 0, 0], horizontalScale, verticalScale, rotationDegrees, cameraType);
        const distance = defaultDistance + lookAtPoint[2];

        cameraControlsRef.current?.setLookAt(lookAtPoint[0], lookAtPoint[1], distance, lookAtPoint[0], lookAtPoint[1], lookAtPoint[2], true);

        if (cameraType === "2d") {
            await cameraControlsRef.current?.zoomTo(150, true);
        }
        else {
            await cameraControlsRef.current?.dollyTo(6, true);
        }
    }

    async function zoomBy(scale: number) {
        const state = useDiagramStore.getState();
        const cameraType = state.cameraType;

        if (cameraType === "2d") {
            await cameraControlsRef.current?.zoom(scale * 100, true);
        }
        else {
            await cameraControlsRef.current?.dolly(scale * distanceZoomFactor, true);
        }
    }

    async function resetCamera() {
        cameraControlsRef.current?.setLookAt(0, 0, defaultDistance, 0, 0, 0, true);

        if (useDiagramStore.getState().cameraType === "2d") {
            await cameraControlsRef.current?.zoomTo(defaultZoom, true);
        }
    }
}