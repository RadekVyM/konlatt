import { CanvasDimensions } from "../../../types/export/CanvasDimensions";
import { Font } from "../../../types/export/Font";
import { LabelGroup } from "../../../types/export/LabelGroup";
import { TextBackgroundType } from "../../../types/export/TextBackgroundType";
import { HsvaColor } from "../../../types/HsvaColor";
import { Link } from "../../../types/Link";
import { Point } from "../../../types/Point";
import { hsvaToHexa } from "../../../utils/colors";
import { outlineWidth } from "../../../utils/export";
import { escapeXml } from "../../../utils/string";
import { CollapseRegions, createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";

type Options = {
    nodeRadius: number,
    linkThickness: number,
    backgroundColor: HsvaColor,
    defaultNodeColor: HsvaColor,
    defaultLinkColor: HsvaColor,
    font: Font,
    textBackgroundType: TextBackgroundType,
    textSize: number,
    textColor: HsvaColor,
    textBackgroundColor: HsvaColor,
    textOutlineColor: HsvaColor,
}

export function convertToSvg(
    transformedLayout: Array<Point> | null,
    links: Array<Link>,
    conceptToLayoutIndexesMapping: Map<number, number>,
    canvasDimensions: CanvasDimensions | null,
    labelGroups: Array<LabelGroup>,
    options: Options,
) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    pushHead(lines, collapseRegions);

    if (!transformedLayout || !canvasDimensions) {
        lines.push(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>`);
        return { lines, collapseRegions: null };
    }

    lines.push(`<svg width="${canvasDimensions.width}" height="${canvasDimensions.height}" xmlns="http://www.w3.org/2000/svg">`);
    collapseRegions.nextRegionStart++;

    pushStyles(lines, collapseRegions, options);

    lines.push("");
    collapseRegions.nextRegionStart++;

    pushBackground(lines, collapseRegions, options);

    lines.push("");
    collapseRegions.nextRegionStart++;

    pushLinks(lines, collapseRegions, links, transformedLayout, conceptToLayoutIndexesMapping, canvasDimensions);

    lines.push("");
    collapseRegions.nextRegionStart++;

    pushNodes(lines, collapseRegions, transformedLayout, canvasDimensions, options);

    lines.push("");
    collapseRegions.nextRegionStart++;

    pushLabels(lines, collapseRegions, INDENTATION, transformedLayout, conceptToLayoutIndexesMapping, canvasDimensions, labelGroups, options);

    lines.push(`</svg>`);

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}

function pushHead(lines: Array<string>, collapseRegions: CollapseRegions) {
    lines.push(`<?xml version="1.0" standalone="no"?>`);
    lines.push(`<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`);
    
    collapseRegions.nextRegionStart += 2;
}

function pushStyles(lines: Array<string>, collapseRegions: CollapseRegions, options: Options) {
    const startCount = lines.length;

    lines.push(`${INDENTATION}<style>`);

    pushCssRule(lines, ".dl", `${INDENTATION}${INDENTATION}`, [
        ["stroke-width", options.linkThickness],
        ["stroke", hsvaToHexa(options.defaultLinkColor)],
    ]);

    pushCssRule(lines, ".dc", `${INDENTATION}${INDENTATION}`, [
        ["fill", hsvaToHexa(options.defaultNodeColor)],
    ]);

    pushCssRule(lines, "text", `${INDENTATION}${INDENTATION}`, [
        ["alignment-baseline", "hanging"],
        ["font", `${options.textSize}px ${options.font}`],
        ["fill", hsvaToHexa(options.textColor)],
        options.textBackgroundType === "outline" ? ["stroke", hsvaToHexa(options.textBackgroundColor)] : undefined,
        options.textBackgroundType === "outline" ? ["stroke-width", outlineWidth(options.textSize)] : undefined,
        options.textBackgroundType === "outline" ? ["paint-order", "stroke fill"] : undefined,
        options.textBackgroundType === "outline" ? ["stroke-linecap", "round"] : undefined,
        options.textBackgroundType === "outline" ? ["stroke-linejoin", "round"] : undefined,
    ]);

    if (options.textBackgroundType === "box") {
        pushCssRule(lines, ".tb", `${INDENTATION}${INDENTATION}`, [
            ["fill", hsvaToHexa(options.textBackgroundColor)],
            ["stroke-width", 1],
            ["stroke", hsvaToHexa(options.textOutlineColor)],
        ]);
    }

    lines.push(`${INDENTATION}</style>`);

    const newLinesCount = lines.length - startCount;

    collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + newLinesCount);
    collapseRegions.nextRegionStart += newLinesCount;
}

function pushCssRule(lines: Array<string>, selector: string, indentation: string, properties: Array<[string, any] | undefined>) {
    lines.push(`${indentation}${selector} {`);

    for (const prop of properties) {
        if (!prop) {
            continue;
        }

        lines.push(`${indentation}${INDENTATION}${prop[0]}: ${prop[1]};`);
    }

    lines.push(`${indentation}}`);
}

function pushBackground(
    lines: Array<string>,
    collapseRegions: CollapseRegions,
    options: Options,
) {
    lines.push(`${INDENTATION}<rect width="100%" height="100%" fill="${hsvaToHexa(options.backgroundColor)}"/>`);
    collapseRegions.nextRegionStart++;
}

function pushLinks(
    lines: Array<string>,
    collapseRegions: CollapseRegions,
    links: Array<Link>,
    layout: Array<Point>,
    conceptToLayoutIndexesMapping: Map<number, number>,
    canvasDimensions: CanvasDimensions,
) {
    if (links.length === 0) {
        return;
    }

    let linksCount = 0;

    for (const link of links) {
        const fromIndex = conceptToLayoutIndexesMapping.get(link.conceptIndex);
        const toIndex = conceptToLayoutIndexesMapping.get(link.subconceptIndex);

        if (fromIndex === undefined || toIndex === undefined) {
            continue;
        }

        const from = layout[fromIndex];
        const to = layout[toIndex];

        lines.push(`${INDENTATION}<line class="dl" x1="${transformed(from, 0, canvasDimensions)}" y1="${transformed(from, 1, canvasDimensions)}" x2="${transformed(to, 0, canvasDimensions)}" y2="${transformed(to, 1, canvasDimensions)}" />`);

        linksCount++;
    }

    if (linksCount > 1) {
        collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + linksCount);
    }
    collapseRegions.nextRegionStart += linksCount;
}

function pushNodes(
    lines: Array<string>,
    collapseRegions: CollapseRegions,
    layout: Array<Point>,
    canvasDimensions: CanvasDimensions,
    options: Options,
) {
    if (layout.length === 0) {
        return;
    }

    let linesCount = 0;

    for (let layoutIndex = 0; layoutIndex < layout.length; layoutIndex++) {
        const point = layout[layoutIndex];

        lines.push(`${INDENTATION}<circle class="dc" cx="${transformed(point, 0, canvasDimensions)}" cy="${transformed(point, 1, canvasDimensions)}" r="${options.nodeRadius}" />`);

        linesCount++;
    }

    if (linesCount > 1) {
        collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + linesCount);
    }
    collapseRegions.nextRegionStart += linesCount;
}

function pushLabels(
    lines: Array<string>,
    collapseRegions: CollapseRegions,
    indentation: string,
    layout: Array<Point>,
    conceptToLayoutIndexesMapping: Map<number, number>,
    canvasDimensions: CanvasDimensions,
    labelGroups: Array<LabelGroup>,
    options: Options,
) {
    const startLinesCount = lines.length;

    for (const group of labelGroups) {

        const layoutIndex = conceptToLayoutIndexesMapping.get(group.conceptIndex);

        if (layoutIndex === undefined || layoutIndex >= layout.length) {
            console.error(`Layout index should not be ${layoutIndex}`);
            continue;
        }

        const point = layout[layoutIndex];
        const nodeX = transformed(point, 0, canvasDimensions);
        const nodeY = transformed(point, 1, canvasDimensions);

        if (options.textBackgroundType === "box") {
            const x = nodeX + group.relativeRect.x;
            const y = nodeY + group.relativeRect.y;
            const width = group.relativeRect.width;
            const height = group.relativeRect.height;
            const cornerRadius = options.textSize / 4;

            lines.push(`${indentation}<rect class="tb" x="${x}" y="${y}" width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}" />`);
        }

        for (const label of group.labels) {
            const x = nodeX + group.relativeRect.x + label.relativeRect.x;
            const y = nodeY + group.relativeRect.y + label.relativeRect.y;

            lines.push(`${indentation}<text x="${x}" y="${y}">${escapeXml(label.text)}</text>`);
        }
    }
    
    const newLinesCount = lines.length - startLinesCount;

    if (newLinesCount > 1) {
        collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + newLinesCount);
    }
    collapseRegions.nextRegionStart += newLinesCount;
}

function transformed(point: Point, coord: number, canvasDimensions: CanvasDimensions) {
    const isY = coord === 1;
    const offset = isY ? canvasDimensions.centerY : canvasDimensions.centerX;
    return (point[coord] * canvasDimensions.scale * (isY ? -1 : 1)) + offset;
}