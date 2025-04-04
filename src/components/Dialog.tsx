import { createPortal } from "react-dom";
import { forwardRef } from "react";
import { cn } from "../utils/tailwind";
import { DialogState } from "../types/DialogState";

export type DialogProps = {
    state: DialogState,
    children?: React.ReactNode,
    className?: string,
    outerClassName?: string,
    onEscape?: () => void,
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(({ state, className, outerClassName, children, onEscape }, ref) => {
    if (!state.isOpen) {
        return undefined;
    }

    return (
        createPortal(
            <dialog
                ref={ref}
                onCancel={async (e) => {
                    e.preventDefault();
                    if (!e.bubbles) {
                        // I want to hide the dialog only when the ESC key is pressed on the dialog.
                        // When the event bubbles, for example, from a file dialog,
                        // I do not want to hide the dialog.
                        if (onEscape) {
                            onEscape();
                        }
                        else {
                            await state.hide();
                        }
                    }
                }}
                className={cn("w-full h-full max-w-full max-h-full p-5",
                    "grid items-center",
                    "bg-transparent backdrop:bg-[rgba(27,30,39,0.5)] dark:backdrop:bg-[rgba(23,25,32,0.8)]",
                    outerClassName,
                    state.animationClass)}>
                <article
                    className={cn(className, "border border-outline-variant m-auto w-full")}>
                    {children}
                </article>
            </dialog>,
            document.querySelector("body") as Element)
    );
});

Dialog.displayName = "Dialog";