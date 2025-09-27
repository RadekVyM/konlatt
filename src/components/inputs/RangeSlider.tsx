import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/tailwind";
import "./RangeSlider.css";

export default function RangeSlider(props: {
    className?: string,
    min: number,
    max: number,
    bottom: number,
    top: number,
    onBottomChange: (value: number) => void,
    onTopChange: (value: number) => void,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [bottomOnTop, setBottomOnTop] = useState(true);

    useEffect(() => {
        updatePosition(props.bottom, "bottom");
    }, [props.bottom]);

    useEffect(() => {
        updatePosition(props.top, "top");
    }, [props.top]);

    function updatePosition(value: number, propSuffix: "bottom" | "top") {
        const rangeLength = props.max - props.min;
        const normalizedValue = value / rangeLength;
        containerRef.current?.style.setProperty(`--position-${propSuffix}`, `${normalizedValue}`);
        return value;
    }

    return (
        <div
            ref={containerRef}
            className={cn("range-slider", props.className)}
            onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const xRel = x / rect.width;
                const rangeLength = props.max - props.min;
                const bottomRange = props.bottom - props.min;
                const topRange = props.top - props.min;
                const rangeMiddle = bottomRange + ((topRange - bottomRange) / 2);
                const rangeMiddleRel = rangeMiddle / rangeLength;

                setBottomOnTop(xRel < rangeMiddleRel);
            }}>
            <input
                className={cn("range-slider-bottom", bottomOnTop ? "z-20 on-top" : "z-10")}
                type="range"
                value={props.bottom}
                onChange={(e) => props.onBottomChange(updatePosition(Math.min(parseFloat(e.target.value), props.top), "bottom"))}
                min={props.min}
                max={props.max}
                step={1} />
            <input
                className={cn("range-slider-top", bottomOnTop ? "z-10" : "z-20 on-top")}
                type="range"
                value={props.top}
                onChange={(e) => props.onTopChange(updatePosition(Math.max(parseFloat(e.target.value), props.bottom), "top"))}
                min={props.min}
                max={props.max}
                step={1} />
        </div>
    );
}