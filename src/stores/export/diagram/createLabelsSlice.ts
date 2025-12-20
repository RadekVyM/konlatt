import { ExportDiagramStore } from "./useExportDiagramStore";
import { createHsvaColor, HsvaColor } from "../../../types/HsvaColor";
import { TextBackgroundType } from "../../../types/export/TextBackgroundType";
import { ConceptLabel } from "../../../types/ConceptLabel";
import { Font } from "../../../types/export/Font";
import withLabels from "./withLabels";
import { LabelGroup } from "../../../types/export/LabelGroup";
import withMeasuredLabelGroups from "./withMeasuredLabelGroups";
import withPositionedLabelGroups from "./withPositionedLabelGroups";
import { w } from "../../../utils/stores";
import withTextResult from "./withTextResult";

type LabelsSliceState = {
    measuringCanvas: OffscreenCanvas,
    maxLabelLineLength: number,
    maxLabelLineCount: number,
    font: Font,
    textSize: number,
    textOffset: number,
    textColor: HsvaColor,
    textBackgroundColor: HsvaColor,
    textOutlineColor: HsvaColor,
    textBackgroundType: TextBackgroundType,
    attributeLabels: Array<ConceptLabel>,
    objectLabels: Array<ConceptLabel>,
    measuredLabelGroups: Array<LabelGroup>,
    measuredBottomLabelPadding: number,
    positionedLabelGroups: Array<LabelGroup>,
}

type LabelsSliceActions = {
    setMaxLabelLineLength: (maxLabelLineLength: number) => void,
    setMaxLabelLineCount: (maxLabelLineCount: number) => void,
    setFont: (font: Font) => void,
    setTextSize: (textSize: number) => void,
    setTextOffset: (textOffset: number) => void,
    setTextColor: (textColor: HsvaColor) => void,
    setTextBackgroundColor: (textBackgroundColor: HsvaColor) => void,
    setTextOutlineColor: (textOutlineColor: HsvaColor) => void,
    setTextBackgroundType: (textBackgroundType: TextBackgroundType) => void,
}

export type LabelsSlice = LabelsSliceState & LabelsSliceActions

export const initialState: LabelsSliceState = {
    measuringCanvas: new OffscreenCanvas(10, 10),
    maxLabelLineLength: 25,
    maxLabelLineCount: 3,
    font: "Arial",
    textSize: 15,
    textOffset: 5,
    textColor: createHsvaColor(0, 0, 0, 1),
    textBackgroundColor: createHsvaColor(0, 0, 1, 1),
    textOutlineColor: createHsvaColor(0, 0, 0.8, 1),
    textBackgroundType: "none",
    attributeLabels: [],
    objectLabels: [],
    measuredLabelGroups: [],
    measuredBottomLabelPadding: 0,
    positionedLabelGroups: [],
};

export default function createDiagramOptionsSlice(set: (partial: ExportDiagramStore | Partial<ExportDiagramStore> | ((state: ExportDiagramStore) => ExportDiagramStore | Partial<ExportDiagramStore>), replace?: false) => void): LabelsSlice {
    return {
        ...initialState,
        setMaxLabelLineLength: (maxLabelLineLength) => set((old) => w({ maxLabelLineLength: Math.max(maxLabelLineLength, 1) }, old, withLabels, withTextResult)),
        setMaxLabelLineCount: (maxLabelLineCount) => set((old) => w({ maxLabelLineCount: Math.max(maxLabelLineCount, 1) }, old, withLabels, withTextResult)),
        setFont: (font) => set((old) => w({ font }, old, withMeasuredLabelGroups, withTextResult)),
        setTextSize: (textSize) => set((old) => w({ textSize: Math.max(textSize, 1) }, old, withMeasuredLabelGroups, withTextResult)),
        setTextOffset: (textOffset) => set((old) => w({ textOffset: Math.max(textOffset, 0) }, old, withPositionedLabelGroups, withTextResult)),
        setTextBackgroundType: (textBackgroundType) => set((old) => w({ textBackgroundType }, old, withPositionedLabelGroups, withTextResult)),
        setTextColor: (textColor) => set((old) => w({ textColor }, old, withTextResult)),
        setTextBackgroundColor: (textBackgroundColor) => set((old) => w({ textBackgroundColor }, old, withTextResult)),
        setTextOutlineColor: (textOutlineColor) => set((old) => w({ textOutlineColor }, old, withTextResult)),
    };
}