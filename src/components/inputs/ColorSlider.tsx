import React, { useEffect, useRef } from "react";
import "./ColorSlider.css";
import { HsvaColor } from "../../types/HsvaColor";
import { hsvaToHexa } from "../../utils/colors";

export default function ColorSlider(props: {
    inputStyle?: React.CSSProperties,
    thumbColor: HsvaColor,
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
        const normalizedValue = Math.min(1, Math.max(value, 0));
        containerRef.current?.style.setProperty("--position", `${normalizedValue}`);
    }

    return (
        <div
            ref={containerRef}
            className="color-slider"
            style={{
                "--thumb-color": hsvaToHexa(props.thumbColor),
            } as React.CSSProperties}>
            <input
                type="range"
                min={0}
                max={1}
                step={0.00001}
                value={props.value}
                onChange={onChange} />
            <div
                className="background"
                style={props.inputStyle}>
            </div>
        </div>
    );
}