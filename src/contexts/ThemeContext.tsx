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
        setCurrentTheme(theme);
    }, []);

    function setTheme(theme: Theme) {
        document.documentElement.setAttribute("data-theme", theme);
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