import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import ErrorPage from "./components/pages/ErrorPage";
import InitialPage from "./components/pages/InitialPage";
import FormalContextPage from "./components/pages/FormalContextPage";
import DiagramPage from "./components/pages/DiagramPage";
import ExplorerPage from "./components/pages/ExplorerPage";
import RootLayout from "./components/layouts/RootLayout";
import useMediaQuery from "./hooks/useMediaQuery";
import { useLayoutEffect } from "react";
import useGlobalsStore from "./stores/useGlobalsStore";
import { Toasts } from "./components/toast";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <ErrorPage withoutNewProjectButton />,
        children: [
            {
                path: "/",
                element: <InitialPage />,
                errorElement: <ErrorPage />,
            },
            {
                element: <MainLayout />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: "/project/context/*",
                        element: <FormalContextPage />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "/project/diagram/*",
                        element: <DiagramPage />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "/project/explorer/*",
                        element: <ExplorerPage />,
                        errorElement: <ErrorPage />,
                    },
                ]
            },
        ]
    }
], { basename: "/konlatt" });

export default function App() {
    return (
        <>
            <ThemeController />
            <RouterProvider router={router} />
            <Toasts />
        </>
    );
}

function ThemeController() {
    const isDark = useMediaQuery("(prefers-color-scheme: dark)");

    useLayoutEffect(() => useGlobalsStore.getState().setPreferedColorScheme(isDark ? "dark" : "light"), [isDark]);

    return undefined;
}