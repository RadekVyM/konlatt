import { Outlet, useLocation } from "react-router-dom";
import useNewProjectStore from "../../stores/useNewProjectStore";
import useDialog from "../../hooks/useDialog";
import { useEffect } from "react";
import NewProjectDialog from "../NewProjectDialog";
import StatusSection from "./StatusSection";
import FormatsButton from "../formats/FormatsButton";
import useHasWindowControlsOverlay from "../../hooks/useHasWindowControlsOverlay";
import NewProjectButton from "./NewProjectButton";
import useWindowControlsOverlayRect from "../../hooks/useWindowControlsOverlayRect";
import { cn } from "../../utils/tailwind";

export default function RootLayout() {
    const newProjectDialogState = useDialog();
    const setDialogState = useNewProjectStore((state) => state.setDialogState);

    useEffect(() => {
        setDialogState(newProjectDialogState);
    }, [newProjectDialogState]);

    return (
        <div
            className="h-full max-h-full flex flex-col">
            <Header />

            <main
                className="flex-1 overflow-hidden">
                <Outlet />
            </main>

            <NewProjectDialog
                state={newProjectDialogState} />
        </div>
    );
}

function Header() {
    const hasWindowControlsOverlay = useHasWindowControlsOverlay();
    const rect = useWindowControlsOverlayRect();
    const isRootPage = useIsRootPage();

    return (
        <>
            <header
                className="grid items-center gap-2 px-3 site-header-layout draggable-region">
                {rect.x === 0 &&
                    <h1
                        className="with-logo flex gap-2.5 items-center font-semibold text-xl ml-0.5">
                        <span className={cn(hasWindowControlsOverlay && !isRootPage && "sr-only")}>konlatt</span>
                    </h1>}

                <StatusSection
                    className="justify-self-center col-start-2" />

                {!hasWindowControlsOverlay && (isRootPage ? 
                    <FormatsButton
                        className="justify-self-end col-start-3"
                        withText /> :
                    <NewProjectButton />
                )}
            </header>

            {isRootPage && hasWindowControlsOverlay &&
                <FormatsButton
                    className="self-end mx-3 mb-2"
                    withText />}
        </>
    );
}

function useIsRootPage() {
    const location = useLocation();
    return location.pathname === "/";
}