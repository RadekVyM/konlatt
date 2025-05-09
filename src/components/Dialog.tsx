import { createPortal } from "react-dom";
import { cn } from "../utils/tailwind";
import { DialogState } from "../types/DialogState";

export type DialogProps = {
    state: DialogState,
    children?: React.ReactNode,
    className?: string,
    outerClassName?: string,
    onEscape?: () => void,
}

export function Dialog(props: {
    ref: React.RefObject<HTMLDialogElement | null>,
} & DialogProps) {
    if (!props.state.isOpen) {
        return undefined;
    }

    return (
        createPortal(
            <dialog
                ref={props.ref}
                onCancel={async (e) => {
                    e.preventDefault();

                    if (!e.bubbles) {
                        // I want to hide the dialog only when the ESC key is pressed on the dialog.
                        // When the event bubbles, for example, from a file dialog,
                        // I do not want to hide the dialog.
                        if (props.onEscape) {
                            props.onEscape();
                        }
                        else {
                            await props.state.hide();
                        }
                    }
                }}
                className={cn("w-full h-full max-w-full max-h-full p-5 safe-area overflow-clip",
                    "grid items-center",
                    "bg-transparent backdrop:bg-[rgba(27,30,39,0.5)] dark:backdrop:bg-[rgba(23,25,32,0.8)]",
                    props.outerClassName,
                    props.state.animationClass)}>
                <article
                    className={cn("border border-outline-variant m-auto w-full", props.className)}>
                    {props.children}
                </article>
            </dialog>,
            document.querySelector("body") as Element)
    );
}