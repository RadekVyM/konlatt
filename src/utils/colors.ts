import { HsvaColor } from "../types/HsvaColor";
import { RgbaColor } from "../types/RgbaColor";

export function hsvaToHexa(color: HsvaColor) {
    const rgba = hsvaToRgba(color);
    return rgbaToHexa(rgba);
}

export function hsvaToRgba({ hue, saturation, value, alpha }: HsvaColor): RgbaColor {
    // https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB

    hue = hue % 360;

    const c = value * saturation;
    const h = hue / 60;
    const x = c * (1 - Math.abs(h % 2 - 1));
    
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 1) {
        r = c, g = x, b = 0;
    }
    else if (1 <= h && h < 2) {
        r = x, g = c, b = 0;
    }
    else if (2 <= h && h < 3) {
        r = 0, g = c, b = x;
    }
    else if (3 <= h && h < 4) {
        r = 0, g = x, b = c;
    }
    else if (4 <= h && h < 5) {
        r = x, g = 0, b = c;
    }
    else if (5 <= h && h < 6) {
        r = c, g = 0, b = x;
    }

    const m = value - c;
    r += m;
    g += m;
    b += m;

    return {
        red: r,
        green: g,
        blue: b,
        alpha,
    };
}

export function rgbaToHexa(color: RgbaColor): string {
    const red = Math.round(color.red * 255);
    const green = Math.round(color.green * 255);
    const blue = Math.round(color.blue * 255);
    const rgbAlpha = Math.round(color.alpha * 255);

    return `#${toHex(red)}${toHex(green)}${toHex(blue)}${toHex(rgbAlpha)}`;
}

export function hexaToHsva(value: string): HsvaColor | null {
    const rgba = hexaToRgba(value);

    if (!rgba) {
        return null;
    }

    // https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
    const max = Math.max(rgba.red, rgba.green, rgba.blue);
    const min = Math.min(rgba.red, rgba.green, rgba.blue);

    const v = max;
    const c = v - min;
    const s = v === 0 ? 0 : c / v;

    let h = 0;

    if (c === 0) {
        h = 0;
    }
    else if (v === rgba.red) {
        h = ((rgba.green - rgba.blue) / c) + (rgba.green < rgba.blue ? 6 : 0);
    }
    else if (v === rgba.green) {
        h = ((rgba.blue - rgba.red) / c) + 2;
    }
    else if (v === rgba.blue) {
        h = ((rgba.red - rgba.green) / c) + 4;
    }
    h *= 60;

    return {
        hue: h,
        saturation: s,
        value: v,
        alpha: rgba.alpha,
    };
}

export function hexaToRgba(value: string) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    value = value
        .replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b + "ff") // 3-digit to 6-digit
        .replace(/^#?([a-f\d]{6})$/i, "$1ff"); // 6-digit to 8-digit

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);

    if (!result) {
        return null;
    }

    const red = parseInt(result[1], 16) / 255;
    const green = parseInt(result[2], 16) / 255;
    const blue = parseInt(result[3], 16) / 255;
    const alpha = parseInt(result[4], 16) / 255;

    return {
        red,
        green,
        blue,
        alpha,
    };
}

function toHex(value: number) {
    const hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}