import { useEffect, useRef } from "react";
import { cn } from "../utils/tailwind";
import { Dialog, DialogProps } from "./Dialog";
import { MdClose } from "react-icons/md";
import Button from "./inputs/Button";
import { useLocation } from "react-router-dom";

export default function ContentDialog(props: {
    ref: React.RefObject<HTMLDialogElement | null>,
    heading: React.ReactNode,
    notHideOnSubsequentLoads?: boolean,
    outerClassName?: string,
    headerClassName?: string,
    disabled?: boolean,
    onCloseClick?: () => void,
} & DialogProps) {
    const initialLoadRef = useRef<boolean>(true);
    const location = useLocation();

    // I forgot why exactly this is needed, but it is because of the new project dialog...
    useEffect(() => {
        if (!props.notHideOnSubsequentLoads && !initialLoadRef.current) {
            props.state.hide().then();
        }

        initialLoadRef.current = false;
    }, [location, props.state.hide]);

    return (
        <Dialog
            ref={props.ref}
            state={props.state}
            onEscape={props.onCloseClick}
            outerClassName={props.outerClassName}
            className={cn("px-5 pb-4 thin-scrollbar rounded-lg bg-surface-container isolate flex flex-col", props.className)}
            disabled={props.disabled}>
            <header
                className={cn("flex justify-between items-center z-50 bg-inherit pt-4 pb-2", props.headerClassName)}>
                <h2 className="font-semibold text-xl">{props.heading}</h2>
                <Button
                    variant="icon-default"
                    disabled={props.disabled}
                    onClick={async () => {
                        if (props.disabled) {
                            return;
                        }

                        if (props.onCloseClick) {
                            props.onCloseClick();
                        }
                        else {
                            await props.state.hide();
                        }
                    }}>
                    <MdClose className="w-5 h-5" />
                </Button>
            </header>

            {props.children}
        </Dialog>
    );
}