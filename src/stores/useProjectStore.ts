import { create } from "zustand";
import LatticeWorkerQueue from "../workers/LatticeWorkerQueue";
import { StatusItem } from "../types/StatusItem";

type ProjectStore = {
    progressMessage: string | null,
    file: File | null,
    workerQueue: LatticeWorkerQueue,
    statusItems: Array<StatusItem>,
    setProgressMessage: (progressMessage: string | null) => void,
    setFile: (file: File | null) => void,
    clearStatusItems: () => void,
    addStatusItem: (jobId: number, title: string, showProgress?: boolean) => void,
    updateStatusItem: (jobId: number, item: Partial<StatusItem>) => void,
    removeStatusItem: (jobId: number) => void,
}

const useProjectStore = create<ProjectStore>((set) => ({
    progressMessage: null,
    file: null,
    workerQueue: new LatticeWorkerQueue(),
    statusItems: [],
    setProgressMessage: (progressMessage) => set(() => ({ progressMessage })),
    setFile: (file) => set(() => ({ file })),
    clearStatusItems: () => set(() => ({ statusItems: [] })),
    addStatusItem: (jobId: number, title: string, showProgress: boolean = true) => set((state) => ({
        statusItems: [
            {
                jobId,
                title,
                isDone: false,
                showProgress,
                progress: 0,
                startTime: new Date().getTime(),
                endTime: -1
            },
            ...state.statusItems]
    })),
    updateStatusItem: (jobId: number, item: Partial<StatusItem>) => set((state) => {
        const statusItemIndex = state.statusItems.findIndex((item) => item.jobId === jobId);

        if (statusItemIndex === -1) {
            return state;
        }

        state.statusItems[statusItemIndex] = {
            ...state.statusItems[statusItemIndex],
            ...item,
        };

        return { statusItems: [...state.statusItems] };
    }),
    removeStatusItem: (jobId: number) => set((old) => ({ statusItems: old.statusItems.filter((item) => item.jobId !== jobId) })),
}));

export default useProjectStore;