import { Canvas } from "@react-three/fiber";
import CameraController from "./CameraController";
import Nodes from "./Nodes";
import { useContext, useEffect } from "react";
import useExplorerStore from "../../../stores/explorer/useExplorerStore";
import { ExplorerZoomActionsContext } from "../../../contexts/ExplorerZoomActionsContext";
import Links from "./Links";
import Labels from "./Labels";

export default function R3FExplorerCanvas(props: {
    className?: string,
}) {
    const canvasEvents = useCanvasEvents();

    return (
        <Canvas
            className={props.className}
            frameloop="demand"
            flat
            gl={{
                antialias: true,
            }}
            dpr={[Math.min(0.25, window.devicePixelRatio), window.devicePixelRatio]}
            performance={{
                min: 0.25,
            }}
            {...canvasEvents}>
            <CameraController />

            <Content />

            <SelectedConceptChangeReaction />
        </Canvas>
    );
}

function Content() {
    return (
        <>
            <Links />
            <Nodes />
            <Labels />
        </>
    );
}

function SelectedConceptChangeReaction() {
    const selectedConceptIndex = useExplorerStore((state) => state.selectedConceptIndex);
    const zoomActionsRef = useContext(ExplorerZoomActionsContext);

    useEffect(() => {
        setTimeout(() => zoomActionsRef.current?.reset(), 0);
    }, [selectedConceptIndex]);

    return <></>;
}

function useCanvasEvents() {
    function onContextMenuCapture(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
    }

    return {
        onContextMenuCapture,
    };
}