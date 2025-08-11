export type CollapseRegions = {
    collapseRegions: Map<number, number>,
    nextRegionStart: number,
}

export function createCollapseRegions(): CollapseRegions {
    return {
        collapseRegions: new Map(),
        nextRegionStart: 0,
    };
}