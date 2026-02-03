import { Font } from "../types/export/Font";
import { LabelGroup } from "../types/export/LabelGroup";
import { TextBackgroundType } from "../types/export/TextBackgroundType";

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

export function labelOutlineWidth(textSize: number) {
    return textSize / 5;
}