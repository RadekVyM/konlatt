import { ThreeEvent } from "@react-three/fiber";

const isMac = /mac/i.test(navigator.userAgent);

export function isCtrlZ(e: React.KeyboardEvent<Element> | KeyboardEvent) {
    return e.key.toLowerCase() === "z" && isCtrl(e);
}

export function isCtrl(e: React.KeyboardEvent<Element> | KeyboardEvent) {
    return isMac ? e.metaKey : e.ctrlKey;
}

export function isRightClick(e: React.MouseEvent<Element> | MouseEvent | ThreeEvent<MouseEvent>) {
    return e.button === 2 || (isMac && e.button === 0 && e.ctrlKey);
}

export function isEditableElement(element: Element) {
    // This may not be all
    return element.nodeName === "INPUT" ||
        element.nodeName === "TEXTAREA" ||
        element.nodeName === "SELECT";
}