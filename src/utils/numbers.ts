export function degreesToRadians(angle: number) {
    return Math.PI * (angle / 180);
}

export function formatBytes(bytes: number) {
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

    return convertedValue.toLocaleString(undefined, {
        style: "unit",
        unit: sizes[i],
        unitDisplay: "short",
        maximumFractionDigits: 2,
    });
}