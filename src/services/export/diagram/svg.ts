import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import { Link } from "../../../types/Link";
import { Point } from "../../../types/Point";
import { transformedLayoutForExport } from "../../../utils/export";
import { CollapseRegions, createCollapseRegions } from "../CollapseRegions";

export function convertToSvg(
    layout: ConceptLatticeLayout | null,
    diagramOffsets: Array<Point> | null,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    _links: Array<Link>,
    _conceptToLayoutIndexesMapping: Map<number, number>,
) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    const transformedLayout = transformedLayoutForExport(layout, diagramOffsets, horizontalScale, verticalScale, rotationDegrees);

    pushHead(lines, collapseRegions);

    if (!transformedLayout) {
        lines.push(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>`);
        return { lines, collapseRegions: null };
    }

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}

function pushHead(lines: Array<string>, collapseRegions: CollapseRegions) {
    lines.push(`<?xml version="1.0" standalone="no"?>`);
    lines.push(`<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`);
    
    collapseRegions.nextRegionStart += 2;
}