export type HsvaColor = {
    hue: number,
    saturation: number,
    value: number,
    alpha: number,
}

export function createHsvaColor(hue: number, saturation: number, value: number, alpha: number = 1): HsvaColor {
    return {
        hue: Math.min(360, Math.max(hue, 0)),
        saturation: Math.min(1, Math.max(saturation, 0)),
        value: Math.min(1, Math.max(value, 0)),
        alpha: Math.min(1, Math.max(alpha, 0))
    };
}