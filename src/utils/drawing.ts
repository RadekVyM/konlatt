import { Font } from "../types/export/Font";
import { LabelGroup } from "../types/export/LabelGroup";
import { TextBackgroundType } from "../types/export/TextBackgroundType";

/**
 * Renders an array of label groups onto a 2D canvas context.
 * * Note: The Y-coordinate is inverted during rendering.
 * @param context - The canvas rendering context (standard or offscreen).
 * @param labelGroups - Collection of labels grouped by layout index and relative rects.
 * @param font - The font family to use for rendering.
 * @param textBackgroundType - The style of background.
 * @param textSize - Base font size in pixels.
 * @param textColorHexa - Hex color for the primary text.
 * @param textBackgroundColorHexa - Hex color for the box fill or the text outline.
 * @param textOutlineColorHexa - Hex color for the box border (if background type is "box").
 * @param position - A callback that maps a layout index to a [x, y] coordinate pair. 
 */
export function drawLabels(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    labelGroups: Array<LabelGroup>,
    font: Font,
    textBackgroundType: TextBackgroundType,
    textSize: number,
    textColorHexa: string,
    textBackgroundColorHexa: string,
    textOutlineColorHexa: string,
    position: (layoutIndex: number) => [number, number] | null,
) {
    const textOutlineWidth = labelOutlineWidth(textSize);

    context.lineCap = "round";
    context.lineJoin = "round";
    context.textBaseline = "hanging";

    context.font = `${textSize}px ${font}`;

    for (const group of labelGroups) {
        const point = position(group.layoutIndex);

        if (!point) {
            continue;
        }

        const nodeX = point[0];
        const nodeY = -point[1];

        if (textBackgroundType === "box") {
            context.fillStyle = textBackgroundColorHexa;
            context.strokeStyle = textOutlineColorHexa;
            context.lineWidth = 1;

            const outlineMargin = context.lineWidth / 2;
            const outlineMarginDoubled = outlineMargin * 2;

            const x = nodeX + group.relativeRect.x + outlineMargin;
            const y = nodeY + group.relativeRect.y + outlineMargin;
            const width = group.relativeRect.width - outlineMarginDoubled;
            const height = group.relativeRect.height - outlineMarginDoubled;

            context.beginPath();
            context.roundRect(x, y, width, height, textSize / 4);
            context.fill();
            context.stroke();
        }

        context.fillStyle = textColorHexa;

        for (const label of group.labels) {
            const x = nodeX + group.relativeRect.x + label.relativeRect.x;
            const y = nodeY + group.relativeRect.y + label.relativeRect.y;

            if (textBackgroundType === "outline") {
                context.strokeStyle = textBackgroundColorHexa;
                context.lineWidth = textOutlineWidth;

                context.strokeText(label.text, x, y);
            }
            context.fillText(label.text, x, y);
        }
    }
}

/**
 * Calculates the stroke width for text outlines based on the current text size.
 * @param textSize - The font size in pixels.
 */
export function labelOutlineWidth(textSize: number) {
    return textSize / 5;
}