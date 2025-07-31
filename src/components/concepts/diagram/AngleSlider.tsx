import { useEffect, useRef } from "react";
import { createRange } from "../../../utils/array";
import { cn } from "../../../utils/tailwind";
import "./AngleSlider.css";

const HALF_TICKS_COUNT = 3;
const TICKS = createRange((HALF_TICKS_COUNT * 2) + 1).map((i) => (i - HALF_TICKS_COUNT) * (180 / (HALF_TICKS_COUNT)));

export default function AngleSlider(props: {
    className?: string,
    id: string,
    value: number,
    onChange: (value: number) => void,
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        updatePosition(props.value);
    }, [props.value]);

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = parseFloat(e.target.value);
        updatePosition(value);
        props.onChange(value);
    }

    function updatePosition(value: number) {
        const normalizedValue = ((value / 180) + 1) / 2;
        containerRef.current?.style.setProperty("--position", `${normalizedValue}`);
    }

    return (
        <div
            ref={containerRef}
            className={cn("angle-slider", props.className)}>
            <input
                id={`${props.id}-angle-input`}
                list={`${props.id}-angle-datalist`}
                type="range"
                min={-180}
                max={180}
                value={props.value}
                onChange={onChange} />
            <datalist
                id={`${props.id}-angle-datalist`}>
                {TICKS.map((tick) =>
                    <option
                        key={tick}
                        value={tick}
                        label={tick.toString()} />)}
            </datalist>
        </div>
    );
}