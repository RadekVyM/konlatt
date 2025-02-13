import { useEffect, useRef } from "react";
import useDimensions from "../../hooks/useDimensions";

export default function DiagramCanvas(props: {
    className?: string,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dimensions = useDimensions(containerRef);
    const width = dimensions.width * window.devicePixelRatio;
    const height = dimensions.height * window.devicePixelRatio;

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (!canvas || !context) {
            return;
        }

        context.clearRect(0, 0, width, height);
        context.fillStyle = "red";
        context.fillText("Hello", 50, 50);
    }, [width, height]);

    return (
        <div
            ref={containerRef}
            className={props.className}>
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                width={width}
                height={height} />
        </div>
    );
}