import { UseBoundStore } from "zustand/react";
import { StoreApi } from "zustand/vanilla";
import { SelectedFormatSlice } from "../createSelectedFormatSlice";

export type SelectedFormatStoreType<TKey> = UseBoundStore<Pick<StoreApi<SelectedFormatSlice<TKey>>, 'getState' | 'getInitialState' | 'subscribe'>>