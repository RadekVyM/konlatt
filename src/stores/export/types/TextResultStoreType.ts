import { UseBoundStore } from "zustand/react";
import { StoreApi } from "zustand/vanilla";
import { TextResultSlice } from "../createTextResultSlice";

export type TextResultStoreType = UseBoundStore<Pick<StoreApi<TextResultSlice>, 'getState' | 'getInitialState' | 'subscribe'>>