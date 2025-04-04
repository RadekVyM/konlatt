import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../utils/tailwind";
import { Dialog, DialogProps } from "./Dialog";
import { MdClose } from "react-icons/md";
import Button from "./inputs/Button";
import { useLocation } from "react-router-dom";

type ContentDialogProps = {
    heading: React.ReactNode,
    notHideOnSubsequentLoads?: boolean,
    outerClassName?: string,
    onCloseClick?: () => void,
} & DialogProps

export const ContentDialog = forwardRef<HTMLDialogElement, ContentDialogProps>(({ heading, className, outerClassName, children, state, notHideOnSubsequentLoads, onCloseClick }, ref) => {
    const initialLoadRef = useRef<boolean>(true);
    const location = useLocation();

    useEffect(() => {
        if (!notHideOnSubsequentLoads && !initialLoadRef.current) {
            state.hide().then();
        }

        initialLoadRef.current = false;
    }, [location, state.hide]);

    return (
        <Dialog
            ref={ref}
            state={state}
            onEscape={onCloseClick}
            outerClassName={outerClassName}
            className={cn("px-5 pb-4 thin-scrollbar rounded-lg bg-surface-container isolate flex flex-col", className)}>
            <header
                className="flex justify-between items-center sticky top-0 z-50 bg-inherit pt-4">
                <h2 className="font-semibold text-xl">{heading}</h2>
                <Button
                    variant="icon-default"
                    onClick={async () => {
                        if (onCloseClick) {
                            onCloseClick();
                        }
                        else {
                            await state.hide();
                        }
                    }}>
                    <MdClose className="w-5 h-5" />
                </Button>
            </header>

            {children}
        </Dialog>
    );
});

ContentDialog.displayName = "ContentDialog";
export default ContentDialog;