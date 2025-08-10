import { useLocation, useNavigate } from "react-router-dom";
import useDialog from "../hooks/useDialog";
import { useEffect } from "react";
import ContentDialog from "./ContentDialog";

export default function FullscreenNavDialog(props: {
    route: string,
    heading: React.ReactNode,
    children?: React.ReactNode,
    onShowing?: () => void,
    onShown?: () => void,
    onHiding?: () => void,
    onHidden?: () => void,
}) {
    const dialogState = useDialog();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const isExport = location.pathname.endsWith(props.route);

        if (!dialogState.isOpen && isExport) {
            props.onShowing?.();
            dialogState.show().then(props.onShown);
        }
        if (dialogState.isOpen && !isExport) {
            props.onHiding?.();
            dialogState.hide().then(props.onHidden);
        }
    }, [location.pathname, dialogState.isOpen, props.route]);

    return (
        <ContentDialog
            ref={dialogState.dialogRef}
            state={dialogState}
            heading="Export"
            className="fullscreen-dialog-content w-full h-full max-h-full overflow-hidden rounded-none bg-surface"
            outerClassName="fullscreen-dialog p-0 backdrop:backdrop-blur-none"
            notHideOnSubsequentLoads={true}
            onCloseClick={() => navigate(-1)}>
            {dialogState.isOpen &&
                props.children}
        </ContentDialog>
    );
}