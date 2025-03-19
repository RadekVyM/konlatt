import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import ErrorPage from "./components/pages/ErrorPage";
import InitialPage from "./components/pages/InitialPage";
import FormalContextPage from "./components/pages/FormalContextPage";
import DiagramPage from "./components/pages/DiagramPage";
import ExplorerPage from "./components/pages/ExplorerPage";
import FormatsPage from "./components/pages/FormatsPage";
import RootLayout from "./components/layouts/RootLayout";

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
                        path: "/project/context",
                        element: <FormalContextPage />
                    },
                    {
                        path: "/project/diagram",
                        element: <DiagramPage />,
                    },
                    {
                        path: "/project/explorer",
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
            <RouterProvider router={router} />
        </>
    );
}