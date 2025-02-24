import { Outlet, useLocation } from "react-router-dom";
import Button from "../inputs/Button";
import { LuChartNetwork, LuDownload, LuTable2 } from "react-icons/lu";
import { cn } from "../../utils/tailwind";

type NavLink = {
    to: string,
    title: string,
    icon: React.ReactNode,
}

const NAV_LINKS: Array<NavLink> = [
    {
        to: "/project/context",
        title: "Context",
        icon: <LuTable2 />
    },
    {
        to: "/project/concepts",
        title: "Concepts",
        icon: <LuChartNetwork />
    },
    {
        to: "/project/export",
        title: "Export",
        icon: <LuDownload />
    },
];

export default function MainLayout() {
    return (
        <div
            className="flex flex-col h-full max-h-full max-w-full">
            <Navigation />
            <Outlet />
        </div>
    );
}

function Navigation() {
    return (
        <nav
            className="flex gap-3 mb-3">
            {NAV_LINKS.map((link) =>
                <NavigationItem
                    key={link.to}
                    link={link} />)}
        </nav>
    );
}

function NavigationItem(props: {
    link: NavLink
}) {
    const location = useLocation();
    const isSelected = location.pathname.startsWith(props.link.to);

    return (
        <Button
            className="py-1.5 pl-1.5 pr-2.5 gap-2 rounded-lg group"
            to={props.link.to}
            variant={isSelected ? "container" : "default"}>
            <div
                className={cn(
                    "p-1 transition-colors rounded-md",
                    isSelected && "bg-primary border-primary text-on-primary")}>
                {props.link.icon}
            </div>
            {props.link.title}
        </Button>
    );
}