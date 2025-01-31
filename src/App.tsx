import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import ErrorPage from "./components/pages/ErrorPage";
import InitialPage from "./components/pages/InitialPage";
import FormalContextPage from "./components/pages/FormalContextPage";
import FormalConceptsPage from "./components/pages/FormalConceptsPage";
import ExportPage from "./components/pages/ExportPage";
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
                        path: "/project/concepts",
                        element: <FormalConceptsPage />,
                    },
                    {
                        path: "/project/export",
                        element: <ExportPage />,
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