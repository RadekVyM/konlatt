export function isCtrlZ(e: React.KeyboardEvent<Element> | KeyboardEvent) {
    return e.key.toLowerCase() === "z" && e.ctrlKey;
}

export function isEditableElement(element: Element) {
    // This may not be all
    return element.nodeName === "INPUT" ||
        element.nodeName === "TEXTAREA" ||
        element.nodeName === "SELECT";
}