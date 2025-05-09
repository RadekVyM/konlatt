import { Outlet, useLocation } from "react-router-dom";
import Button from "../inputs/Button";
import { LuRoute, LuTable2 } from "react-icons/lu";
import { cn } from "../../utils/tailwind";
import useHasWindowControlsOverlay from "../../hooks/useHasWindowControlsOverlay";
import NewProjectButton from "./NewProjectButton";

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
        to: "/project/diagram",
        title: "Diagram",
        icon: <LatticeIcon />
    },
    {
        to: "/project/explorer",
        title: "Explorer",
        icon: <LuRoute />
    },
];

export default function MainLayout() {
    const hasWindowsControlOverlay = useHasWindowControlsOverlay();

    return (
        <div
            className="flex flex-col h-full max-h-full max-w-full">
            <div
                className="flex justify-between items-center mb-2.5 px-3">
                <Navigation />

                {hasWindowsControlOverlay &&
                    <NewProjectButton />}
            </div>
            <Outlet />
        </div>
    );
}

function Navigation() {
    return (
        <nav
            className="flex-1 flex gap-2.5">
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

function LatticeIcon(props: {
    className?: string
}) {
    // based on LuWaypoints

    return (
        <svg width="1em" height="1em" viewBox="0 0 5.821 6.1" {...props}>
            <g style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} transform="translate(-.265 -.264)scale(.26458)">
                <path d="m10.2 6.3-3.9 3.9m7.5 7.5 3.9-3.9" style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} transform="matrix(-1 0 0 1 24 0)" />
                <circle cx="12" cy="4.5" r="2.5" />
                <path d="m10.2 6.3-3.9 3.9" />
                <circle cx="4.5" cy="12" r="2.5" />
                <circle cx="19.5" cy="12" r="2.5" />
                <path d="m13.8 17.7 3.9-3.9" />
                <circle cx="12" cy="19.5" r="2.5" />
            </g>
        </svg>
    );
}