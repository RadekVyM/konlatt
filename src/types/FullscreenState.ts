export type FullscreenState = {
    toggleFullscreen: () => Promise<void>,
    requestFullscreen: () => Promise<void>,
    exitFullscreen: () => Promise<void>,
    isFullscreen: boolean,
    isFullscreenEnabled: boolean,
}