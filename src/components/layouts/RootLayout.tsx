import { Outlet } from "react-router-dom";
import Button from "../inputs/Button";
import { LuFolderPlus } from "react-icons/lu";
import useNewProjectStore from "../../hooks/stores/useNewProjectStore";
import useDialog from "../../hooks/useDialog";
import { useEffect } from "react";
import NewProjectDialog from "../NewProjectDialog";
import StatusSection from "./StatusSection";

export default function RootLayout() {
    const dialogState = useDialog();
    const setDialogState = useNewProjectStore((state) => state.setDialogState);

    useEffect(() => {
        setDialogState(dialogState);
    }, [dialogState]);

    return (
        <div
            className="h-full max-h-full flex flex-col">
            <header
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 px-4 min-h-13">
                <h1 className="with-logo flex gap-2.5 items-center font-semibold text-xl">
                    konlatt
                </h1>

                <StatusSection />

                <Button
                    className="justify-self-end col-start-3"
                    onClick={() => dialogState.show()}
                    variant="container">
                    <LuFolderPlus />
                    <span className="text-sm leading-4">New project</span>
                </Button>
            </header>

            <main
                className="flex-1 overflow-hidden">
                <Outlet />
            </main>

            <NewProjectDialog
                state={dialogState} />
        </div>
    );
}