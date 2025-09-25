export function isMobileUserAgent() {
    return /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
}