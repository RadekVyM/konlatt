import { LuMonitor, LuMoon, LuSettings, LuSun } from "react-icons/lu";
import Button from "./inputs/Button";
import { cn } from "../utils/tailwind";
import { useContext, useRef } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import useDimensionsListener from "../hooks/useDimensionsListener";
import useEventListener from "../hooks/useEventListener";

export default function ThemeSwitcherButton(props: {
    className?: string,
}) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEventListener("resize", () => updatePopoverPosition());
    useDimensionsListener(buttonRef, () => updatePopoverPosition());

    function updatePopoverPosition() {
        const popover = document.getElementById("theme-popover");

        if (!popover || !buttonRef.current) {
            return;
        }

        const rect = buttonRef.current.getBoundingClientRect();

        popover.style.top = `${rect.bottom}px`;
        popover.style.left = `${rect.right}px`;
    }

    return (
        <>
            <Button
                ref={buttonRef}
                className={props.className}
                onClick={() => updatePopoverPosition()}
                variant="icon-default"
                title="Options"
                popoverTarget="theme-popover">
                <LuSettings />
            </Button>
            <Popover />
        </>
    );
}

function Popover(props: {
    className?: string,
}) {
    const { currentTheme, setCurrentTheme } = useContext(ThemeContext);

    const selectedVariant = "icon-primary";
    const deselectedVariant = "icon-secondary";

    return (
        <article
            className={cn(
                "hidden open:block isolate",
                "pointer-events-auto slide-down-popover-transition open:absolute inset-[unset] -translate-x-full mt-1",
                "bg-surface-container rounded-xl border border-outline-variant px-3 pb-2 pt-1 drop-shadow-2xl drop-shadow-shade",
                props.className)}
            id="theme-popover"
            popover="auto">
            <h2
                className="text-sm mb-1 text-on-surface-container-muted">
                Theme
            </h2>
            <div
                className="flex gap-2">
                <Button
                    className="flex-1"
                    variant={currentTheme === "light" ? selectedVariant : deselectedVariant}
                    title="Light"
                    onClick={() => setCurrentTheme("light")}>
                    <LuSun />
                </Button>
                <Button
                    className="flex-1"
                    variant={currentTheme === "system" ? selectedVariant : deselectedVariant}
                    title="System"
                    onClick={() => setCurrentTheme("system")}>
                    <LuMonitor />
                </Button>
                <Button
                    className="flex-1"
                    variant={currentTheme === "dark" ? selectedVariant : deselectedVariant}
                    title="Dark"
                    onClick={() => setCurrentTheme("dark")}>
                    <LuMoon />
                </Button>
            </div>
        </article>
    );
}