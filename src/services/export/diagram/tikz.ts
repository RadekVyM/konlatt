import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import { Link } from "../../../types/Link";
import { Point } from "../../../types/Point";
import { transformedLayoutForExport } from "../../../utils/export";
import { layoutRect } from "../../../utils/layout";
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

    pushEndPicture(lines);
    return { lines, collapseRegions: collapseRegions.collapseRegions };
}

function pushStartPictureWithOptions(
    lines: Array<string>,
    collapseRegions: CollapseRegions,
) {
    lines.push("\\begin{tikzpicture}[");
    lines.push("\t/tikz/xScale/.store in=\\xScale,");
    lines.push("\t/tikz/yScale/.store in=\\yScale,");
    lines.push(`\tdeclare function={`);
    lines.push(`\t\txpos(\\n) = \\xScale * \\n pt;`);
    lines.push(`\t\typos(\\n) = \\yScale * \\n pt;`);
    lines.push(`\t},`);
    lines.push(`\tdefaultNode/.style={`);
    lines.push(`\t\tcircle,`);
    lines.push(`\t\tfill=black,`);
    lines.push(`\t\tminimum size=8pt,`);
    lines.push(`\t\tinner sep=0pt`);
    lines.push(`\t},`);
    lines.push(`\txScale=${SCALE},`);
    lines.push(`\tyScale=${SCALE}`);
    lines.push("]");
    collapseRegions.nextRegionStart += 16;
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
    let linksCount = 0;

    for (const link of links) {
        const fromIndex = conceptToLayoutIndexesMapping.get(link.conceptIndex);
        const toIndex = conceptToLayoutIndexesMapping.get(link.subconceptIndex);

        if (fromIndex === undefined || toIndex === undefined) {
            continue;
        }

        const from = layout[fromIndex];
        const to = layout[toIndex];

        lines.push(`\t\\draw[-] (${pointToTikz(from)}) -- (${pointToTikz(to)});`);

        linksCount++;
    }

    collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + linksCount);
    collapseRegions.nextRegionStart += linksCount;
}

function pushNodes(
    lines: Array<string>,
    collapseRegions: CollapseRegions,
    layout: Array<Point>,
) {
    let linesCount = 0;

    for (let layoutIndex = 0; layoutIndex < layout.length; layoutIndex++) {
        const point = layout[layoutIndex];

        lines.push(`\t\\node[defaultNode] (${layoutIndex}) at (${pointToTikz(point)}) {};`);

        linesCount++;
    }

    collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + linesCount);
    collapseRegions.nextRegionStart += linesCount;
}

function pointToTikz(point: Point) {
    return `{xpos(${point[0].toLocaleString("us", { maximumFractionDigits: 3 })})}, {ypos(${point[1].toLocaleString("us", { maximumFractionDigits: 3 })})}`;
}