import { useContext } from "react";
import { ExplorerZoomActionsContext } from "../../../contexts/ExplorerZoomActionsContext";
import useExplorerStore from "../../../stores/explorer/useExplorerStore";
import ZoomBar from "../../ZoomBar";
import Button from "../../inputs/Button";
import { LuFocus } from "react-icons/lu";

const ZOOM_STEP = 0.1;

export default function ExplorerActions(props: {
    className?: string,
    showSpinner?: boolean,
}) {
    return (
        <div
            className={props.className}>
            <div
                className={"absolute bottom-0 right-0 flex gap-2 pointer-events-auto m-3"}>
                <DiagramZoomBar />    
                <ZoomToCenterButton />
            </div>
        </div>
    );
}

function ZoomToCenterButton(props: {
    className?: string,
}) {
    const zoomActionsRef = useContext(ExplorerZoomActionsContext);

    return (
        <Button
            className={props.className}
            title="Zoom to center"
            variant="icon-secondary"
            onClick={() => zoomActionsRef.current?.reset()}>
            <LuFocus />
        </Button>
    );
}

function DiagramZoomBar(props: {
    className?: string,
}) {
    const zoomActionsRef = useContext(ExplorerZoomActionsContext);
    const currentZoomLevel = useExplorerStore((state) => state.currentZoomLevel);

    function onIncrease() {
        zoomActionsRef.current?.zoomBy(ZOOM_STEP);
    }

    function onDecrease() {
        zoomActionsRef.current?.zoomBy(-ZOOM_STEP);
    }

    return (
        <ZoomBar
            className={props.className}
            currentZoomLevel={currentZoomLevel}
            onDecreaseClick={onDecrease}
            onIncreaseClick={onIncrease} />
    );
}