import { create } from "zustand";
import { Theme } from "../types/Theme";

type GlobalsStore = {
    currentTheme: Theme,
    setCurrentTheme: (currentTheme: Theme) => void,
}

const useGlobalsStore = create<GlobalsStore>((set) => ({
    currentTheme: "light",
    setCurrentTheme: (currentTheme: Theme) => set(() => ({ currentTheme })),
}));

export default useGlobalsStore;