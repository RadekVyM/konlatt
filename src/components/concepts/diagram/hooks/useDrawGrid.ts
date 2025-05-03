import { useCallback } from "react";
import { GRID_LINE_GAP, GRID_LINE_GAP_HALF, GRID_LINE_STEP, GRID_LINE_STEP_HALF, GRID_LINES_INVISIBLE_THRESHOLD } from "../../../../constants/diagram";

export default function useDrawGrid(
    width: number,
    height: number,
    translateX: number,
    translateY: number,
    scale: number,
) {
    const drawGrid = useCallback((
        context: CanvasRenderingContext2D,
        computedStyle: CSSStyleDeclaration,
    ) => {
        const outlineColor = computedStyle.getPropertyValue("--outline-variant");
        const deviceWidth = width * window.devicePixelRatio;
        const deviceHeight = height * window.devicePixelRatio;
        const centerX = deviceWidth / 2;
        const centerY = deviceHeight / 2;
        const deviceScale = scale * window.devicePixelRatio;
        const gridLineStep = GRID_LINE_STEP * deviceScale;
        const gridLineStepHalf = GRID_LINE_STEP_HALF * deviceScale;
        const gridLineGap = GRID_LINE_GAP * deviceScale;
        const gridLineGapHalf = GRID_LINE_GAP_HALF * deviceScale;

        const left = -translateX * window.devicePixelRatio;
        const top = -translateY * window.devicePixelRatio;
        const right = left + (deviceWidth);
        const bottom = top + (deviceHeight);
        const startX = left + ((centerX * scale - left) % gridLineStep);
        const startY = top + ((centerY * scale - top) % gridLineStep);

        context.lineWidth = 1.5 * window.devicePixelRatio;

        if (gridLineStepHalf > GRID_LINES_INVISIBLE_THRESHOLD) {
            context.beginPath();
            for (let x = startX - gridLineStepHalf; x < right; x += gridLineStep) {
                context.moveTo(x, startY - gridLineStep + gridLineGapHalf);
                context.lineTo(x, bottom);
            }
            for (let y = startY - gridLineStepHalf; y < bottom; y += gridLineStep) {
                context.moveTo(startX - gridLineStep + gridLineGapHalf, y);
                context.lineTo(right, y);
            }
            context.strokeStyle = outlineColor;
            context.setLineDash([gridLineGap, gridLineGap]);
            context.stroke();
        }

        context.beginPath();
        for (let x = startX - gridLineStep; x < right; x += gridLineStep) {
            context.moveTo(x, top);
            context.lineTo(x, bottom);
        }
        for (let y = startY - gridLineStep; y < bottom; y += gridLineStep) {
            context.moveTo(left, y);
            context.lineTo(right, y);
        }
        context.strokeStyle = outlineColor;
        context.setLineDash([]);
        context.stroke();
    }, [width, height, translateX, translateY, scale]);

    return drawGrid;
}