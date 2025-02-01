import { Outlet, useLocation } from "react-router-dom";
import Button from "../Button";

type NavLink = {
    to: string,
    title: string,
}

const NAV_LINKS: Array<NavLink> = [
    {
        to: "/project/context",
        title: "Context",
    },
    {
        to: "/project/concepts",
        title: "Concepts",
    },
    {
        to: "/project/export",
        title: "Export",
    },
];

export default function MainLayout() {
    return (
        <div
            className="flex flex-col h-full max-w-full">
            <Navigation />
            <Outlet />
        </div>
    );
}

function Navigation() {
    const location = useLocation();

    return (
        <nav
            className="flex gap-4 mb-4">
            {NAV_LINKS.map((link) =>
                <Button
                    key={link.to}
                    to={link.to}
                    variant={location.pathname.startsWith(link.to) ? "container" : "default"}>
                    {link.title}
                </Button>)}
        </nav>
    );
}