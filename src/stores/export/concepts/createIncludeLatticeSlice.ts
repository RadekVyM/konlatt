import { w } from "../../../utils/stores";

type IncludeLatticeSliceState = {
    includeLattice: boolean,
}

type IncludeLatticeSliceActions = {
    setIncludeLattice: React.Dispatch<React.SetStateAction<boolean>>,
}

export type IncludeLatticeSlice = IncludeLatticeSliceState & IncludeLatticeSliceActions

export const initialState: IncludeLatticeSliceState = {
    includeLattice: false,
};

export default function createIncludeLatticeSlice<TStore extends IncludeLatticeSlice>(
    set: (partial: IncludeLatticeSlice | Partial<IncludeLatticeSlice> | ((state: TStore) => IncludeLatticeSlice | Partial<IncludeLatticeSlice>), replace?: false) => void,
    withResult: (newState: Partial<IncludeLatticeSlice>, oldState: TStore) => Partial<TStore>,
    withTooLarge: (newState: Partial<IncludeLatticeSlice>, oldState: TStore) => Partial<TStore>,
): IncludeLatticeSlice {
    return {
        ...initialState,
        setIncludeLattice: (includeLattice) => set((old) => w({
            includeLattice: (typeof includeLattice === "function" ?
                includeLattice(old.includeLattice) :
                includeLattice)
        } as Partial<TStore>, old, withTooLarge, withResult)),
    };
}