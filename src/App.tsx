import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import ErrorPage from "./components/pages/ErrorPage";
import InitialPage from "./components/pages/InitialPage";
import FormalContextPage from "./components/pages/FormalContextPage";
import DiagramPage from "./components/pages/DiagramPage";
import ExplorerPage from "./components/pages/ExplorerPage";
import FormatsPage from "./components/pages/FormatsPage";
import RootLayout from "./components/layouts/RootLayout";
import useMediaQuery from "./hooks/useMediaQuery";
import { useEffect } from "react";
import useGlobalsStore from "./stores/useGlobalsStore";
import { Toasts } from "./components/toast";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <InitialPage />,
            },
            {
                element: <MainLayout />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: "/project/context/*",
                        element: <FormalContextPage />,
                    },
                    {
                        path: "/project/diagram/*",
                        element: <DiagramPage />,
                    },
                    {
                        path: "/project/explorer/*",
                        element: <ExplorerPage />,
                    },
                ]
            },
            {
                path: "formats",
                element: <FormatsPage />,
            },
        ]
    }
]);

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

    useEffect(() => useGlobalsStore.getState().setCurrentTheme(isDark ? "dark" : "light"), [isDark]);

    return undefined;
}