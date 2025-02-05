import { forwardRef } from "react";
import { cn } from "../utils/tailwind";
import { Dialog, DialogProps } from "./Dialog";
import { MdClose } from "react-icons/md";
import Button from "./inputs/Button";

type ContentDialogProps = {
    heading: React.ReactNode,
} & DialogProps

export const ContentDialog = forwardRef<HTMLDialogElement, ContentDialogProps>(({ heading, className, children, state }, ref) => {
    return (
        <Dialog
            ref={ref}
            state={state}
            className={cn(className, "px-5 pb-4 thin-scrollbar rounded-lg bg-surface-container isolate flex flex-col")}>
            <header
                className="flex justify-between items-center sticky top-0 z-50 bg-inherit pt-4">
                <h2 className="font-semibold text-xl">{heading}</h2>
                <Button
                    variant="icon-default"
                    onClick={async () => await state.hide()}>
                    <MdClose className="w-5 h-5" />
                </Button>
            </header>

            {children}
        </Dialog>
    );
});

ContentDialog.displayName = "ContentDialog";
export default ContentDialog;