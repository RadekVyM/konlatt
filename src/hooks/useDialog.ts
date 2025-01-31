import { useCallback, useEffect, useRef, useState } from "react";
import { DialogState } from "../types/DialogState";

export default function useDialog(
    openAnimation?: string,
    hideAnimation?: string
): DialogState {
    const [animationClass, setAnimationClass] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const show = useCallback(() => {
        setAnimationClass(openAnimation || "backdrop:animate-fadeIn animate-slideUpIn");
        setIsOpen(true);
    }, []);

    const hide = useCallback((): Promise<void> => {
        setAnimationClass(hideAnimation || "backdrop:animate-fadeOut animate-slideDownOut");
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                setIsOpen(false);
                clearTimeout(timeout);
                resolve(undefined);
            }, 150);
        });
    }, []);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        }
        else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    return {
        dialogRef,
        animationClass,
        isOpen,
        show,
        hide
    };
}