import { useEffect, useRef, useState } from "react";
import { DialogState } from "../types/DialogState";
import { dispatchTopLayerChanged } from "../components/toast";

const ANIMATION_LENGTH = 150;

export default function useDialog(
    openAnimation?: string,
    hideAnimation?: string
): DialogState {
    const [animationClass, setAnimationClass] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        }
        else {
            dialogRef.current?.close();
        }

        dispatchTopLayerChanged();
    }, [isOpen]);

    function show(): Promise<void> {
        setAnimationClass(openAnimation || "backdrop:animate-fadeIn animate-slideUpIn");
        setIsOpen(true);
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                clearTimeout(timeout);
                resolve(undefined);
            }, ANIMATION_LENGTH);
        });
    }

    function hide(): Promise<void> {
        setAnimationClass(hideAnimation || "backdrop:animate-fadeOut animate-slideDownOut");
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                setIsOpen(false);
                clearTimeout(timeout);
                resolve(undefined);
            }, ANIMATION_LENGTH);
        });
    }

    return {
        dialogRef,
        animationClass,
        isOpen,
        show,
        hide
    };
}