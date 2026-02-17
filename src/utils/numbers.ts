/**
 * Converts an angle from degrees to radians.
 * @param angle - The angle in degrees to be converted.
 * @returns The angle expressed in radians.
 */
export function degreesToRadians(angle: number) {
    return Math.PI * (angle / 180);
}

/**
 * Formats a numeric byte value into a human-readable string with units (e.g., KB, MB).
 * @param bytes - The number of bytes to format.
 * @param locales - Optional locale string or array for number formatting.
 * @returns A localized string representing the byte size with the appropriate unit.
 */
export function formatBytes(bytes: number, locales?: Intl.LocalesArgument) {
    if (bytes === 0) {
        return bytes.toLocaleString(undefined, {
            style: "unit",
            unit: "byte",
            unitDisplay: "short",
        });
    }

    const k = 1000;
    const sizes = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    const convertedValue = bytes / Math.pow(k, i);

    return convertedValue.toLocaleString(locales, {
        style: "unit",
        unit: sizes[i],
        unitDisplay: "short",
        maximumFractionDigits: 2,
    });
}

/**
 * Formats a duration in milliseconds into a shorthand string (e.g., "1d 2h 30m").
 * @param time - The duration in milliseconds.
 * @returns A formatted string of time components, or undefined if the input is negative.
 */
export function formatTimeInterval(time: number) {
    if (time < 0) {
        return undefined;
    }

    const seconds = Math.floor(time / 1000);
    const day = 60 * 60 * 24;
    const hour = 60 * 60;
    const minute = 60;

    const days = Math.floor(seconds / day);
    const hours = Math.floor((seconds % day) / hour);
    const minutes = Math.floor((seconds % hour) / minute);
    const secs = seconds % minute;
    const millis = time - (seconds * 1000);

    const parts = new Array<string>();

    if (days > 0) {
        parts.push(`${days}d`);
    }
    if (hours > 0) {
        parts.push(`${hours}h`);
    }
    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }
    if (secs > 0) {
        parts.push(`${secs}s`);
    }
    if (parts.length === 0) {
        parts.push(`${millis}ms`);
    }

    return parts.join(" ");
}