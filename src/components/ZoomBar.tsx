import { LuMinus, LuPlus } from "react-icons/lu";
import { cn } from "../utils/tailwind";
import Button from "./inputs/Button";

/**
 * Compact zoom control component featuring decrement/increment buttons 
 * and a central percentage display.
*/
export default function ZoomBar(props: {
    className?: string,
    currentZoomLevel: number,
    onDecreaseClick: () => void,
    onIncreaseClick: () => void,
}) {
    const zoomLevel = 100 * props.currentZoomLevel;

    return (
        <div
            className={cn("flex items-center gap-1 bg-secondary rounded-md", props.className)}>
            <Button
                variant="icon-secondary"
                title="Zoom out"
                onClick={props.onDecreaseClick}>
                <LuMinus />
            </Button>
            <span className="text-sm w-10 text-center">
                {zoomLevel < 1 ?
                    zoomLevel.toLocaleString(undefined, { maximumFractionDigits: 2 }) :
                    Math.round(zoomLevel)}%
            </span>
            <Button
                variant="icon-secondary"
                title="Zoom in"
                onClick={props.onIncreaseClick}>
                <LuPlus />
            </Button>
        </div>
    );
}