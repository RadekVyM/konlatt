import { useEffect, useRef, useState } from "react";
import useDialog from "../../hooks/useDialog";
import useEventListener from "../../hooks/useEventListener";
import { DialogState } from "../../types/DialogState";
import { HsvaColor } from "../../types/HsvaColor";
import { hexaToHsva, hsvaToHexa, hsvaToRgba } from "../../utils/colors";
import ContentDialog from "../ContentDialog";
import Button from "./Button";
import ColorSlider from "./ColorSlider";
import { cn } from "../../utils/tailwind";
import Input from "./Input";
import { LuCheck, LuClipboard, LuCopy } from "react-icons/lu";
import toast from "../toast";

export type ColorInputProps = {
    className?: string,
    color: HsvaColor,
    onChange: (color: HsvaColor) => void,
}

export default function ColorInput(props: ColorInputProps) {
    const dialogState = useDialog();
    const lastValidColorRef = useRef<HsvaColor>(null);
    const inputFocusedRef = useRef<boolean>(false);
    const [input, setInput] = useState("#00000000");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (inputFocusedRef.current) {
            return;
        }
        lastValidColorRef.current = props.color;
        setInput(hsvaToHexa(props.color));
    }, [props.color]);

    async function copyToClipboard() {
        const value = hsvaToHexa(props.color);

        if (!navigator?.clipboard) {
            console.error("Clipboard not supported");
            toast("Clipboard not supported");
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
        } catch (error) {
            console.error("Copy failed", error);
            toast("Copy failed");
            return;
        }

        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    async function pasteFromClipboard() {
        const copiedText = await navigator.clipboard.readText();
        const newColor = hexaToHsva(copiedText.trim());

        if (newColor) {
            props.onChange(newColor);
        }
    }

    return (
        <>
            <div
                className="flex gap-x-2">
                <Button
                    onClick={dialogState.show}
                    variant="icon-secondary"
                    title="Pick color">
                    <ColorPreview
                        className="rounded-md w-6 h-6"
                        color={props.color} />
                </Button>

                <Input
                    className="flex-1"
                    value={input}
                    onChange={(e) => {
                        const value = e.target.value;
                        const newColor = hexaToHsva(value.trim());

                        if (newColor) {
                            lastValidColorRef.current = newColor;
                            props.onChange(newColor);
                        }

                        setInput(value);
                    }}
                    onFocus={() => inputFocusedRef.current = true}
                    onBlur={() => {
                        inputFocusedRef.current = false;

                        if (lastValidColorRef.current) {
                            setInput(hsvaToHexa(lastValidColorRef.current));
                        }
                    } } />

                <Button
                    variant="icon-secondary"
                    title="Copy color to clipboard"
                    onClick={copyToClipboard}>
                    {copied ?
                        <LuCheck /> :
                        <LuCopy />}
                </Button>

                <Button
                    variant="icon-secondary"
                    title="Paste color from clipboard"
                    onClick={pasteFromClipboard}>
                    <LuClipboard />
                </Button>
            </div>

            <ColorDialog
                state={dialogState}
                color={props.color}
                onChange={props.onChange} />
        </>
    );
}

function ColorDialog(props: {
    state: DialogState,
    color: HsvaColor,
    onChange: (color: HsvaColor) => void,
}) {
    const rgbaColor = hsvaToRgba(props.color);
    const rgbString = `${rgbaColor.red * 100}%, ${rgbaColor.green * 100}%, ${rgbaColor.blue * 100}%`;

    return (
        <ContentDialog
            ref={props.state.dialogRef}
            heading="Color picker"
            state={props.state}
            className="max-w-sm">
            <div
                className="grid grid-cols-[1fr_auto_auto] grid-rows-[1fr_auto] gap-3 pt-0.5">
                <SaturationValuePicker
                    color={props.color}
                    onChange={props.onChange}
                    className="h-52" />

                <ColorSlider
                    className="h-52"
                    inputStyle={{
                        background: `linear-gradient(
                            rgb(255, 0, 0) 0%,
                            rgb(255, 0, 0) calc(var(--spacing) * 2),
                            rgb(255, 255, 0) calc(var(--spacing) * 2 + (100% - var(--spacing) * 4) * (1 / 6)),
                            rgb(0, 255, 0) calc(var(--spacing) * 2 + (100% - var(--spacing) * 4) * (2 / 6)),
                            rgb(0, 255, 255) calc(var(--spacing) * 2 + (100% - var(--spacing) * 4) * (3 / 6)),
                            rgb(0, 0, 255) calc(var(--spacing) * 2 + (100% - var(--spacing) * 4) * (4 / 6)),
                            rgb(255, 0, 255) calc(var(--spacing) * 2 + (100% - var(--spacing) * 4) * (5 / 6)),
                            rgb(255, 0, 0) calc(100% - var(--spacing) * 2),
                            rgb(255, 0, 0) 100%)`,
                    }}
                    thumbColor={{ hue: props.color.hue, saturation: 1, value: 1, alpha: 1 }}
                    value={1 - (props.color.hue / 360)}
                    onChange={(newHue) => props.onChange({ ...props.color, hue: (1 - newHue) * 360 })} />

                <ColorSlider
                    className="h-52"
                    inputStyle={{
                        background: `linear-gradient(
                            rgba(${rgbString}, 0) 0%,
                            rgba(${rgbString}, 0) calc(var(--spacing) * 2),
                            rgba(${rgbString}, 100%) calc(100% - var(--spacing) * 2),
                            rgba(${rgbString}, 100%) 100%)`
                    }}
                    thumbColor={props.color}
                    value={1 - props.color.alpha}
                    onChange={(newAlpha) => props.onChange({ ...props.color, alpha: 1 - newAlpha })} />

                <ColorPreview
                    className="col-start-1 col-end-4 h-8 rounded-md"
                    color={props.color} />
            </div>
        </ContentDialog>
    );
}

function ColorPreview(props: {
    className?: string,
    color: HsvaColor,
}) {
    return (
        <div
            className={cn("checkered-fine overflow-hidden border border-outline", props.className)}>
            <div
                className="h-full w-full"
                style={{ background: hsvaToHexa(props.color) }} />
        </div>
    );
}

function SaturationValuePicker(props: {
    className?: string,
    color: HsvaColor,
    onChange: (color: HsvaColor) => void,
}) {
    const isPointerDown = useRef<boolean>(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const topRightColor = hsvaToRgba({ hue: props.color.hue, saturation: 1, value: 1, alpha: 1 });

    function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
        isPointerDown.current = true;
        onPointerMove(e.clientX, e.clientY);
    }

    function onPointerMove(clientX: number, clientY: number) {
        if (!isPointerDown.current || !pickerRef.current) {
            return;
        }

        const rect = pickerRef.current.getBoundingClientRect();

        const left = Math.min(Math.max(rect.left, clientX), rect.right) - rect.left;
        const top = Math.min(Math.max(rect.top, clientY), rect.bottom) - rect.top;

        const saturation = left / rect.width;
        const value = 1 - (top / rect.height);

        props.onChange({ ...props.color, saturation, value });
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        const offset = 0.01;

        switch (e.key) {
            case "ArrowRight":
                props.onChange({ ...props.color, saturation: Math.min(props.color.saturation + offset, 1) });
                break;
            case "ArrowLeft":
                props.onChange({ ...props.color, saturation: Math.max(props.color.saturation - offset, 0) });
                break;
            case "ArrowUp":
                props.onChange({ ...props.color, value: Math.min(props.color.value + offset, 1) });
                break;
            case "ArrowDown":
                props.onChange({ ...props.color, value: Math.max(props.color.value - offset, 0) });
                break;
        }
    }

    useEventListener("pointermove", (e) => {
        onPointerMove(e.clientX, e.clientY);
    });

    useEventListener("pointerup", () => {
        isPointerDown.current = false;
    });

    useEventListener("pointercancel", () => {
        isPointerDown.current = false;
    });

    useEventListener("selectstart", (e) => {
        if (isPointerDown.current) {
            e.preventDefault();
        }
    });

    return (
        <div
            ref={pickerRef}
            tabIndex={0}
            className={cn("border border-outline rounded-md relative cursor-crosshair", props.className)}
            style={{
                background: `
                    linear-gradient(0deg, rgb(0, 0, 0), transparent),
                    linear-gradient(90deg, rgb(255, 255, 255), rgb(${topRightColor.red * 100}%, ${topRightColor.green * 100}%, ${topRightColor.blue * 100}%))`
            }}
            onPointerDown={onPointerDown}
            onKeyDown={onKeyDown}>
            <div
                className="absolute w-4 h-4 box-border border-4 border-white rounded-full z-50 pointer-events-none select-none"
                style={{
                    background: hsvaToHexa({ ...props.color, alpha: 1 }),
                    left: `calc(${props.color.saturation * 100}% - var(--spacing) * 2)`,
                    top: `calc(${(1 - props.color.value) * 100}% - var(--spacing) * 2)`,
                    boxShadow: "0 0 0 1px lightgray",
                }}>
            </div>
        </div>
    );
}