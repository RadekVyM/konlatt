import { Outlet } from "react-router-dom";
import Button from "../Button";
import { LuFolderPlus } from "react-icons/lu";
import useDialog from "../../hooks/useDialog";
import NewProjectDialog from "../NewProjectDialog";

export default function RootLayout() {
    const dialogState = useDialog();
    
    return (
        <div
            className="flex flex-col px-5">
            <header
                className="flex justify-between items-center py-4">
                <h1 className="font-semibold text-lg">
                    😶 cancellos
                </h1>

                <Button
                    onClick={() => dialogState.show()}
                    variant="container">
                    <LuFolderPlus />
                    <span className="text-sm">New project</span>
                </Button>
            </header>

            <main
                className="flex-1">
                <Outlet />
            </main>

            <NewProjectDialog
                state={dialogState} />
        </div>
    );
}