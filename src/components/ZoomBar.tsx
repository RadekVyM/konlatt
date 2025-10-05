import { LuMinus, LuPlus } from "react-icons/lu";
import { cn } from "../utils/tailwind";
import Button from "./inputs/Button";

export default function ZoomBar(props: {
    className?: string,
    currentZoomLevel: number,
    onDecreaseClick: () => void,
    onIncreaseClick: () => void,
}) {
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
                {Math.round(100 * props.currentZoomLevel)}%
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