import { create } from "zustand";
import { CurrentTheme, Theme } from "../types/Theme";
import { withFallback } from "../utils/stores";
import { THEME_STORAGE_KEY } from "../constants/theme";

type GlobalsStore = {
    preferedColorScheme: "light" | "dark",
    theme: Theme,
    currentTheme: CurrentTheme,
    setTheme: (currentTheme: Theme) => void,
    setPreferedColorScheme: (preferedColorScheme: "light" | "dark") => void,
}

const useGlobalsStore = create<GlobalsStore>((set) => ({
    currentTheme: "light",
    theme: (localStorage.getItem(THEME_STORAGE_KEY) || "system") as Theme,
    preferedColorScheme: "light",
    setTheme: (theme) => set((old) => {
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

        return withCurrentTheme({ theme }, old);
    }),
    setPreferedColorScheme: (preferedColorScheme) => set((old) => withCurrentTheme({ preferedColorScheme }, old)),
}));

export default useGlobalsStore;

function withCurrentTheme(newState: Partial<GlobalsStore>, oldState: GlobalsStore): Partial<GlobalsStore> {
    const theme = withFallback(newState.theme, oldState.theme);
    const preferedColorScheme = withFallback(newState.preferedColorScheme, oldState.preferedColorScheme);

    return {
        ...newState,
        currentTheme: theme === "system" ?
            preferedColorScheme :
            theme,
    };
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