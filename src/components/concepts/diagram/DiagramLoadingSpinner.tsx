import { useEffect, useRef } from "react";
import useGlobalsStore from "../../../stores/useGlobalsStore";
import useProjectStore from "../../../stores/useProjectStore";
import useCurrentTime from "../../../hooks/useCurrentTime";
import { LuLoaderCircle } from "react-icons/lu";
import { formatTimeInterval } from "../../../utils/numbers";

const THICKNESS = 4;
const RADIUS = 22;
const DIAMETER = 2 * RADIUS;

export default function DiagramLoadingSpinner() {
    const statusItems = useProjectStore((state) => state.statusItems);
    const item = statusItems.find((item) => item.tag === "layout" && !item.isDone && !item.isError);
    
    if (!item) {
        return (
            <LuLoaderCircle
                style={{
                    width: `${DIAMETER}px`,
                    height: `${DIAMETER}px`,
                }}
                className="animate-spin text-surface-dim-container" />
        );
    }

    return (
        <Spinner
            progress={item.progress}
            startTime={item.startTime} />
    );
}

function Spinner(props: {
    progress: number,
    startTime: number,
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const currentTheme = useGlobalsStore((state) => state.currentTheme);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (!canvas || !context) {
            return;
        }

        const styles = getComputedStyle(canvas);
        const primaryColor = styles.getPropertyValue("--primary");
        const mutedColor = styles.getPropertyValue("--surface-dim-container");

        const radius = canvas.width / 2;
        const startAngle = -Math.PI / 2;
        const realRadius = radius - (THICKNESS / 2);

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();

        context.strokeStyle = mutedColor;
        context.lineWidth = THICKNESS;
        context.lineCap = "round";

        context.beginPath();
        context.arc(radius, radius, realRadius, 0, 2 * Math.PI);
        context.stroke();
        context.restore();

        context.save();

        context.strokeStyle = primaryColor;
        context.lineWidth = THICKNESS;
        context.lineCap = "round";

        context.beginPath();
        context.arc(radius, radius, realRadius, startAngle, (props.progress * 2 * Math.PI) + startAngle);
        context.stroke();
        context.restore();
    }, [props.progress, currentTheme]);

    return (
        <div
            className="relative">
            <canvas
                ref={canvasRef}
                style={{
                    width: `${DIAMETER}px`,
                    height: `${DIAMETER}px`,
                }}
                width={DIAMETER * window.devicePixelRatio}
                height={DIAMETER * window.devicePixelRatio} />
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm">
                {props.progress.toLocaleString(undefined, { style: "percent" })}
            </div>
            <span
                className="absolute top-full left-1/2 -translate-x-1/2 text-xs text-on-surface-container-muted mt-1.5 w-max">
                <Time
                    startTime={props.startTime} />
            </span>
        </div>
    );
}

function Time(props: {
    startTime: number,
}) {
    const currentTime = useCurrentTime(true);
    const time = currentTime - props.startTime;

    return formatTimeInterval(time);
}