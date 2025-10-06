export function generateStats(times: ReadonlyArray<number>) {
    const timesSum = times.reduce((prev, current) => prev + current, 0);
    const average = timesSum / times.length;
    const deviationsSum = times.reduce((prev, current) => prev + Math.pow(current - average, 2), 0);
    const variance = deviationsSum / times.length;
    const stdDeviation = Math.sqrt(variance);

    return {
        average,
        stdDeviation,
    };
}