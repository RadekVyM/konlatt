import { createContext, useLayoutEffect, useState } from "react";

type Theme = "system" | "light" | "dark"

type ThemeState = {
    currentTheme: Theme,
    setCurrentTheme: (theme: Theme) => void,
}

const THEME_STORAGE_KEY = "theme";

export const ThemeContext = createContext<ThemeState>({
    currentTheme: "system",
    setCurrentTheme: () => {},
});

export function ThemeContextProvider(props: {
    children: React.ReactNode,
}) {
    const [currentTheme, setCurrentTheme] = useState<Theme>("system");

    useLayoutEffect(() => {
        const theme = (localStorage.getItem(THEME_STORAGE_KEY) || "system") as Theme;
        setTheme(theme);
    }, []);

    function setTheme(theme: Theme) {
        document.documentElement.setAttribute("data-theme", theme);

        document.querySelectorAll('meta[name="theme-color"]').forEach((tag) => tag.remove());

        const lightColor = getComputedStyle(document.documentElement)
            .getPropertyValue("--surface-light")
            .trim();
        const darkColor = getComputedStyle(document.documentElement)
            .getPropertyValue("--surface-dark")
            .trim();

        switch (theme) {
            case "system":
                appendThemeColorMeta(lightColor, "(prefers-color-scheme: light)");
                appendThemeColorMeta(darkColor, "(prefers-color-scheme: dark)");
                break;
            case "light":
                appendThemeColorMeta(lightColor);
                break;
            case "dark":
                appendThemeColorMeta(darkColor);
                break;
        }

        localStorage.setItem(THEME_STORAGE_KEY, theme);
        setCurrentTheme(theme);
    }

    return (
        <ThemeContext.Provider value={{
            currentTheme,
            setCurrentTheme: setTheme,
        }}>
            {props.children}
        </ThemeContext.Provider>
    );
}

function appendThemeColorMeta(color: string, media?: string) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.setAttribute("content", color);
    if (media) {
        meta.setAttribute("media", media);
    }
    document.head.appendChild(meta);
}
