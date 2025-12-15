import { ConceptLabel } from "../../../types/ConceptLabel";
import { Link } from "../../../types/Link";
import { Point } from "../../../types/Point";
import { sortedLabelsByPosition } from "../../../utils/diagram";
import { layoutRect } from "../../../utils/layout";
import { escapeTikz } from "../../../utils/string";
import { CollapseRegions, createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";

const SCALE = 50;

export function convertToTikz(
    transformedLayout: Array<Point> | null,
    links: Array<Link>,
    conceptToLayoutIndexesMapping: Map<number, number>,
    attributeLabels: Array<ConceptLabel>,
    objectLabels: Array<ConceptLabel>,
) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    if (!transformedLayout) {
        lines.push("\\begin{tikzpicture}");
        collapseRegions.nextRegionStart++;

        pushEndPicture(lines);
        return { lines, collapseRegions: null };
    }

    const rect = layoutRect(transformedLayout);
    transformedLayout = transformedLayout.map((point) => {
        const newPoint: Point = [...point];

        newPoint[0] -= rect.left;
        newPoint[1] -= rect.bottom;

        return newPoint;
    });

    attributeLabels = sortedLabelsByPosition(attributeLabels, transformedLayout, conceptToLayoutIndexesMapping);
    objectLabels = sortedLabelsByPosition(objectLabels, transformedLayout, conceptToLayoutIndexesMapping);

    pushStartPictureWithOptions(lines, collapseRegions);

    pushLinks(lines, collapseRegions, links, transformedLayout, conceptToLayoutIndexesMapping);

    lines.push("");
    collapseRegions.nextRegionStart++;

    pushNodes(lines, collapseRegions, transformedLayout);

    lines.push("");
    collapseRegions.nextRegionStart++;

    pushObjectLabels(lines, collapseRegions, conceptToLayoutIndexesMapping, objectLabels);

    lines.push("");
    collapseRegions.nextRegionStart++;

    pushAttributeLabels(lines, collapseRegions, conceptToLayoutIndexesMapping, attributeLabels);

    pushEndPicture(lines);
    return { lines, collapseRegions: collapseRegions.collapseRegions };
}

function pushStartPictureWithOptions(
    lines: Array<string>,
    collapseRegions: CollapseRegions,
) {
    const startCount = lines.length;

    lines.push("\\begin{tikzpicture}[");
    lines.push(`${INDENTATION}declare function={`);
    lines.push(`${INDENTATION}${INDENTATION}xpos(\\n) = ${SCALE} * \\n pt;`);
    lines.push(`${INDENTATION}${INDENTATION}ypos(\\n) = ${SCALE} * \\n pt;`);
    lines.push(`${INDENTATION}},`);
    lines.push(`${INDENTATION}defaultNode/.style={`);
    lines.push(`${INDENTATION}${INDENTATION}circle,`);
    lines.push(`${INDENTATION}${INDENTATION}fill=black,`);
    lines.push(`${INDENTATION}${INDENTATION}minimum size=8pt,`);
    lines.push(`${INDENTATION}${INDENTATION}inner sep=0pt`);
    lines.push(`${INDENTATION}},`);
    lines.push(`${INDENTATION}defaultLink/.style={`);
    lines.push(`${INDENTATION}${INDENTATION}draw=gray`);
    lines.push(`${INDENTATION}},`);
    lines.push(`${INDENTATION}objectLabel/.style={`);
    lines.push(`${INDENTATION}${INDENTATION}below,`);
    lines.push(`${INDENTATION}${INDENTATION}yshift=-1pt,`);
    lines.push(`${INDENTATION}${INDENTATION}align=center,`);
    lines.push(`${INDENTATION}${INDENTATION}font=\\tiny,`);
    lines.push(`${INDENTATION}${INDENTATION}fill=white,`);
    lines.push(`${INDENTATION}${INDENTATION}draw=gray,`);
    lines.push(`${INDENTATION}${INDENTATION}rounded corners`);
    lines.push(`${INDENTATION}},`);
    lines.push(`${INDENTATION}attributeLabel/.style={`);
    lines.push(`${INDENTATION}${INDENTATION}above,`);
    lines.push(`${INDENTATION}${INDENTATION}yshift=1pt,`);
    lines.push(`${INDENTATION}${INDENTATION}align=center,`);
    lines.push(`${INDENTATION}${INDENTATION}font=\\tiny,`);
    lines.push(`${INDENTATION}${INDENTATION}fill=white,`);
    lines.push(`${INDENTATION}${INDENTATION}draw=gray,`);
    lines.push(`${INDENTATION}${INDENTATION}rounded corners`);
    lines.push(`${INDENTATION}}`);
    lines.push("]");
    collapseRegions.nextRegionStart += lines.length - startCount;
}

function pushEndPicture(lines: Array<string>) {
    lines.push("\\end{tikzpicture}");
}

function pushLinks(
    lines: Array<string>,
    collapseRegions: CollapseRegions,
    links: Array<Link>,
    layout: Array<Point>,
    conceptToLayoutIndexesMapping: Map<number, number>,
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

        lines.push(`${INDENTATION}\\draw[defaultLink] (${pointToTikz(from)}) -- (${pointToTikz(to)});`);

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
) {
    if (layout.length === 0) {
        return;
    }

    let linesCount = 0;

    for (let layoutIndex = 0; layoutIndex < layout.length; layoutIndex++) {
        const point = layout[layoutIndex];

        lines.push(`${INDENTATION}\\node[defaultNode] (${layoutIndex}) at (${pointToTikz(point)}) {};`);

        linesCount++;
    }

    if (linesCount > 1) {
        collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + linesCount);
    }
    collapseRegions.nextRegionStart += linesCount;
}

function pushAttributeLabels(
    lines: Array<string>,
    collapseRegions: CollapseRegions,
    conceptToLayoutIndexesMapping: Map<number, number>,
    attributeLabels: Array<ConceptLabel>,
) {
    if (attributeLabels.length === 0) {
        return;
    }

    let linesCount = 0;

    for (const label of attributeLabels) {
        const layoutIndex = conceptToLayoutIndexesMapping.get(label.conceptIndex);

        lines.push(`${INDENTATION}\\node[attributeLabel] at (${layoutIndex}.north) {${escapeTikz(label.text)}};`);

        linesCount++;
    }

    if (linesCount > 1) {
        collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + linesCount);
    }
    collapseRegions.nextRegionStart += linesCount;
}

function pushObjectLabels(
    lines: Array<string>,
    collapseRegions: CollapseRegions,
    conceptToLayoutIndexesMapping: Map<number, number>,
    objectLabels: Array<ConceptLabel>,
) {
    if (objectLabels.length === 0) {
        return;
    }

    let linesCount = 0;

    for (const label of objectLabels) {
        const layoutIndex = conceptToLayoutIndexesMapping.get(label.conceptIndex);

        lines.push(`${INDENTATION}\\node[objectLabel] at (${layoutIndex}.south) {${escapeTikz(label.text)}};`);

        linesCount++;
    }

    if (linesCount > 1) {
        collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + linesCount);
    }
    collapseRegions.nextRegionStart += linesCount;
}

function pointToTikz(point: Point) {
    const x = point[0].toLocaleString("us", { maximumFractionDigits: 3 });
    const y = point[1].toLocaleString("us", { maximumFractionDigits: 3 });

    return `{xpos(${x})}, {ypos(${y})}`;
}