import { ConceptLabel } from "../../../types/ConceptLabel";
import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import { Link } from "../../../types/Link";
import { Point } from "../../../types/Point";
import { transformedLayoutForExport } from "../../../utils/export";
import { layoutRect } from "../../../utils/layout";
import { escapeTikz } from "../../../utils/string";
import { CollapseRegions, createCollapseRegions } from "../CollapseRegions";

const SCALE = 50;

export function convertToTikz(
    layout: ConceptLatticeLayout | null,
    diagramOffsets: Array<Point> | null,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    links: Array<Link>,
    conceptToLayoutIndexesMapping: Map<number, number>,
    attributeLabels: Array<ConceptLabel>,
    objectLabels: Array<ConceptLabel>,
) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    const transformedLayout = transformedLayoutForExport(layout, diagramOffsets, horizontalScale, verticalScale, rotationDegrees);

    if (!transformedLayout) {
        lines.push("\\begin{tikzpicture}");
        collapseRegions.nextRegionStart++;

        pushEndPicture(lines);
        return { lines, collapseRegions: null };
    }

    const rect = layoutRect(transformedLayout);

    for (const point of transformedLayout) {
        point[0] -= rect.left;
        point[1] -= rect.top;
    }

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
    lines.push(`\tdeclare function={`);
    lines.push(`\t\txpos(\\n) = ${SCALE} * \\n pt;`);
    lines.push(`\t\typos(\\n) = ${SCALE} * \\n pt;`);
    lines.push(`\t},`);
    lines.push(`\tdefaultNode/.style={`);
    lines.push(`\t\tcircle,`);
    lines.push(`\t\tfill=black,`);
    lines.push(`\t\tminimum size=8pt,`);
    lines.push(`\t\tinner sep=0pt`);
    lines.push(`\t},`);
    lines.push(`\tdefaultLink/.style={`);
    lines.push(`\t\tdraw=gray`);
    lines.push(`\t},`);
    lines.push(`\tobjectLabel/.style={`);
    lines.push(`\t\tbelow,`);
    lines.push(`\t\tyshift=-1pt,`);
    lines.push(`\t\talign=center,`);
    lines.push(`\t\tfont=\\tiny,`);
    lines.push(`\t\tfill=white,`);
    lines.push(`\t\tdraw=gray,`);
    lines.push(`\t\trounded corners`);
    lines.push(`\t},`);
    lines.push(`\tattributeLabel/.style={`);
    lines.push(`\t\tabove,`);
    lines.push(`\t\tyshift=1pt,`);
    lines.push(`\t\talign=center,`);
    lines.push(`\t\tfont=\\tiny,`);
    lines.push(`\t\tfill=white,`);
    lines.push(`\t\tdraw=gray,`);
    lines.push(`\t\trounded corners`);
    lines.push(`\t}`);
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

        lines.push(`\t\\draw[defaultLink] (${pointToTikz(from)}) -- (${pointToTikz(to)});`);

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

        lines.push(`\t\\node[defaultNode] (${layoutIndex}) at (${pointToTikz(point)}) {};`);

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

        lines.push(`\t\\node[attributeLabel] at (${layoutIndex}.north) {${escapeTikz(label.text)}};`);

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

        lines.push(`\t\\node[objectLabel] at (${layoutIndex}.south) {${escapeTikz(label.text)}};`);

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