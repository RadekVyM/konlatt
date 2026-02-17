import { create } from "zustand";
import MainWorkerQueue from "../workers/MainWorkerQueue";
import { StatusItem } from "../types/StatusItem";

type ProjectStore = {
    progressMessage: string | null,
    name: string | null,
    workerQueue: MainWorkerQueue,
    statusItems: Array<StatusItem>,
    replaceWorkerQueue: (workerQueue: MainWorkerQueue) => void,
    setProgressMessage: (progressMessage: string | null) => void,
    setName: (name: string) => void,
    clearStatusItems: () => void,
    addStatusItem: (jobId: number, title: string, rest?: StatusItemOptions) => void,
    updateStatusItem: (jobId: number, item: Partial<StatusItem>) => void,
    removeStatusItem: (jobId: number) => void,
}

type StatusItemOptions = {
    isDone?: boolean,
    isError?: boolean,
    showProgress?: boolean,
    progress?: number,
    startTime?: number,
    endTime?: number,
    tag?: string,
}

const useProjectStore = create<ProjectStore>((set) => ({
    progressMessage: null,
    name: null,
    workerQueue: new MainWorkerQueue(),
    statusItems: [],
    replaceWorkerQueue: (workerQueue) => set((old) => {
        old.workerQueue.dispose();
        return { workerQueue };
    }),
    setProgressMessage: (progressMessage) => set(() => ({ progressMessage })),
    setName: (file) => set(() => ({ name: file })),
    clearStatusItems: () => set(() => ({ statusItems: [] })),
    addStatusItem: (
        jobId: number,
        title: string,
        rest?: StatusItemOptions
    ) => set((state) => ({
        statusItems: [
            {
                jobId,
                title,
                isDone: rest?.isDone ?? false,
                isError: rest?.isError ?? false,
                showProgress: rest?.showProgress ?? true,
                progress: rest?.progress ?? 0,
                startTime: rest?.startTime ?? new Date().getTime(),
                endTime: rest?.endTime ?? -1,
                tag: rest?.tag,
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