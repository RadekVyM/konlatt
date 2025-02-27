import { Outlet } from "react-router-dom";
import Button from "../inputs/Button";
import { LuFolderPlus, LuLoaderCircle } from "react-icons/lu";
import useProjectStore from "../../hooks/stores/useProjectStore";
import useNewProjectStore from "../../hooks/stores/useNewProjectStore";
import useDialog from "../../hooks/useDialog";
import { useEffect } from "react";
import NewProjectDialog from "../NewProjectDialog";

export default function RootLayout() {
    const progressMessage = useProjectStore((state) => state.progressMessage);
    const file = useProjectStore((state) => state.file);
    const dialogState = useDialog();
    const setDialogState = useNewProjectStore((state) => state.setDialogState);

    useEffect(() => {
        setDialogState(dialogState);
    }, [dialogState]);
    
    return (
        <div
            className="h-full max-h-full flex flex-col">
            <header
                className="flex justify-between items-center py-2 px-4 min-h-13">
                <h1 className="with-logo flex gap-2.5 items-center font-semibold text-xl">
                    konlatt
                </h1>

                <div
                    className="flex flex-col items-center">
                    {file &&
                        <span
                            className="text-sm text-on-surface">
                            {file.name}
                        </span>}
                    {progressMessage &&
                        <span
                            className="text-xs text-on-surface-muted flex items-center gap-1.5">
                            <LuLoaderCircle className="animate-spin" />
                            {progressMessage}
                        </span>}
                </div>

                <Button
                    onClick={() => dialogState.show()}
                    variant="container">
                    <LuFolderPlus />
                    <span className="text-sm">New project</span>
                </Button>
            </header>

            <main
                className="flex-1 px-4 overflow-hidden">
                <Outlet />
            </main>
            
            <NewProjectDialog
                state={dialogState} />
        </div>
    );
}