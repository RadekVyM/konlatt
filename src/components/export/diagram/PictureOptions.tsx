import { LuLock, LuLockOpen } from "react-icons/lu";
import { EXPORT_DIMENSIONS_TEMPLATES } from "../../../constants/diagram-export";
import useExportDiagramStore from "../../../stores/export/diagram/useExportDiagramStore";
import { DiagramExportDimensionsTemplateKey } from "../../../types/export/DiagramExportDimensionsTemplate";
import { cn } from "../../../utils/tailwind";
import Button from "../../inputs/Button";
import ComboBox from "../../inputs/ComboBox";
import { DropDownMenuItem } from "../../inputs/DropDownMenu";
import InputLabel from "../../inputs/InputLabel";
import ConfigSection from "../../layouts/ConfigSection";
import DebouncedColorInput from "../../inputs/DebouncedColorInput";
import DebouncedNumberInput from "../../inputs/DebouncedNumberInput";
import DebouncedPrefixedNumberInput from "../../inputs/DebouncedPrefixedNumberInput";
import { TextBackgroundType } from "../../../types/export/TextBackgroundType";
import { Font } from "../../../types/export/Font";
import { DEBOUNCE_DELAY } from "./constants";
import LabelLineInputs from "./LabelLineInputs";

export default function PictureOptions() {
    return (
        <>
            <LayoutSection />

            <AppearanceSection />

            <TextSection />
        </>);
}

function AppearanceSection() {
    const backgroundColor = useExportDiagramStore((state) => state.backgroundColor);
    const defaultNodeColor = useExportDiagramStore((state) => state.defaultNodeColor);
    const defaultLinkColor = useExportDiagramStore((state) => state.defaultLinkColor);
    const nodeRadius = useExportDiagramStore((state) => state.nodeRadius);
    const linkThickness = useExportDiagramStore((state) => state.linkThickness);
    const setBackgroundColor = useExportDiagramStore((state) => state.setBackgroundColor);
    const setDefaultNodeColor = useExportDiagramStore((state) => state.setDefaultNodeColor);
    const setDefaultLinkColor = useExportDiagramStore((state) => state.setDefaultLinkColor);
    const setNodeRadius = useExportDiagramStore((state) => state.setNodeRadius);
    const setLinkThickness = useExportDiagramStore((state) => state.setLinkThickness);

    return (
        <ConfigSection
            heading="Appearance"
            className="mx-4">
            <div>
                <InputLabel>
                    Background color
                </InputLabel>
                <DebouncedColorInput
                    delay={DEBOUNCE_DELAY}
                    color={backgroundColor}
                    onChange={setBackgroundColor} />
            </div>
            <div>
                <InputLabel>
                    Default node color
                </InputLabel>
                <DebouncedColorInput
                    delay={DEBOUNCE_DELAY}
                    color={defaultNodeColor}
                    onChange={setDefaultNodeColor} />
            </div>
            <div>
                <InputLabel>
                    Default link color
                </InputLabel>
                <DebouncedColorInput
                    delay={DEBOUNCE_DELAY}
                    color={defaultLinkColor}
                    onChange={setDefaultLinkColor} />
            </div>
            <div
                className="grid grid-cols-2 gap-2">
                <DebouncedNumberInput
                    id="export-diagram-node-radius"
                    delay={DEBOUNCE_DELAY}
                    label="Node radius"
                    value={nodeRadius}
                    onChange={setNodeRadius}
                    min={1} />
                <DebouncedNumberInput
                    id="export-diagram-link-thickness"
                    delay={DEBOUNCE_DELAY}
                    label="Link thickness"
                    value={linkThickness}
                    onChange={setLinkThickness}
                    min={1} />
            </div>
        </ConfigSection>
    );
}

function LayoutSection() {
    return (
        <ConfigSection
            heading="Layout"
            className="mx-4 pt-2">
            <TemplateSelection />

            <MaxDimensions />

            <Padding />
        </ConfigSection>
    );
}

function TemplateSelection() {
    const maxWidth = useExportDiagramStore((state) => state.maxWidth);
    const maxHeight = useExportDiagramStore((state) => state.maxHeight);
    const setDimensions = useExportDiagramStore((state) => state.setDimensions);
    const templates: Array<DropDownMenuItem<DiagramExportDimensionsTemplateKey>> = [
        { key: "custom", label: "Custom", disabled: true },
        ...EXPORT_DIMENSIONS_TEMPLATES.map((template) => ({
            key: template.key,
            label: `${template.title} (${template.largerSize}×${template.smallerSize})`
        })),
    ];
    const selectedKey = EXPORT_DIMENSIONS_TEMPLATES.find((template) =>
        (template.largerSize === maxWidth && template.smallerSize === maxHeight) ||
        (template.smallerSize === maxWidth && template.largerSize === maxHeight))?.key || "custom";

    return (
        <div>
            <InputLabel>Template</InputLabel>
            <ComboBox<DiagramExportDimensionsTemplateKey>
                id="export-layout-template"
                items={templates}
                selectedKey={selectedKey}
                onKeySelectionChange={(key) => {
                    const template = EXPORT_DIMENSIONS_TEMPLATES.find((template) => template.key === key);

                    if (template) {
                        setDimensions(template.largerSize, template.smallerSize);
                    }
                }}>
            </ComboBox>
        </div>
    );
}

function MaxDimensions() {
    const maxWidth = useExportDiagramStore((state) => state.maxWidth);
    const maxHeight = useExportDiagramStore((state) => state.maxHeight);
    const maxDimensionsLockedAspecRatio = useExportDiagramStore((state) => state.maxDimensionsLockedAspecRatio);
    const setMaxWidth = useExportDiagramStore((state) => state.setMaxWidth);
    const setMaxHeight = useExportDiagramStore((state) => state.setMaxHeight);
    const setMaxDimensionsLockedAspecRatio = useExportDiagramStore((state) => state.setMaxDimensionsLockedAspecRatio);

    return (
        <div>
            <InputLabel>Maximum size</InputLabel>
            <div
                className="grid grid-cols-[1fr_1fr_auto] gap-x-2">
                {maxDimensionsLockedAspecRatio &&
                    <div
                        className="col-2 row-1 -ml-2.5 w-3 h-4 bg-surface-lite-dim-container self-center aspect-ratio-bridge-clip">
                    </div>}
                <DebouncedPrefixedNumberInput
                    id="export-diagram-max-width"
                    delay={DEBOUNCE_DELAY}
                    className="col-1 row-1"
                    prefix="W"
                    min={0}
                    value={maxWidth}
                    onChange={setMaxWidth} />
                <DebouncedPrefixedNumberInput
                    id="export-diagram-max-height"
                    delay={DEBOUNCE_DELAY}
                    className="col-2 row-1"
                    prefix="H"
                    min={0}
                    value={maxHeight}
                    onChange={setMaxHeight} />
                <Button
                    variant="icon-secondary"
                    size="sm"
                    className={cn("h-full w-full col-3 row-1", maxDimensionsLockedAspecRatio && "text-primary-dim")}
                    title={maxDimensionsLockedAspecRatio ? "Unlock the aspect ratio" : "Lock the aspect ratio"}
                    onClick={() => setMaxDimensionsLockedAspecRatio((old) => !old)}>
                    {maxDimensionsLockedAspecRatio ? <LuLock /> : <LuLockOpen />}
                </Button>
            </div>
        </div>
    );
}

function Padding() {
    const minPaddingLeft = useExportDiagramStore((state) => state.minPaddingLeft);
    const minPaddingRight = useExportDiagramStore((state) => state.minPaddingRight);
    const minPaddingTop = useExportDiagramStore((state) => state.minPaddingTop);
    const minPaddingBottom = useExportDiagramStore((state) => state.minPaddingBottom);
    const setMinPaddingLeft = useExportDiagramStore((state) => state.setMinPaddingLeft);
    const setMinPaddingRight = useExportDiagramStore((state) => state.setMinPaddingRight);
    const setMinPaddingTop = useExportDiagramStore((state) => state.setMinPaddingTop);
    const setMinPaddingBottom = useExportDiagramStore((state) => state.setMinPaddingBottom);

    return (
        <div>
            <InputLabel>Minimum padding</InputLabel>
            <div
                className="grid grid-cols-[1fr_1fr] gap-2">
                <DebouncedPrefixedNumberInput
                    id="export-diagram-padding-left"
                    delay={DEBOUNCE_DELAY}
                    className="col-1 row-1"
                    prefix="L"
                    min={0}
                    value={minPaddingLeft}
                    onChange={setMinPaddingLeft} />
                <DebouncedPrefixedNumberInput
                    id="export-diagram-padding-right"
                    delay={DEBOUNCE_DELAY}
                    className="col-2 row-1"
                    prefix="R"
                    min={0}
                    value={minPaddingRight}
                    onChange={setMinPaddingRight} />
                <DebouncedPrefixedNumberInput
                    id="export-diagram-padding-top"
                    delay={DEBOUNCE_DELAY}
                    className="col-1 row-2"
                    prefix="T"
                    min={0}
                    value={minPaddingTop}
                    onChange={setMinPaddingTop} />
                <DebouncedPrefixedNumberInput
                    id="export-diagram-padding-bottom"
                    delay={DEBOUNCE_DELAY}
                    className="col-2 row-2"
                    prefix="B"
                    min={0}
                    value={minPaddingBottom}
                    onChange={setMinPaddingBottom} />
            </div>
        </div>
    );
}

function TextSection() {
    const font = useExportDiagramStore((state) => state.font);
    const textSize = useExportDiagramStore((state) => state.textSize);
    const textOffset = useExportDiagramStore((state) => state.textOffset);
    const textColor = useExportDiagramStore((state) => state.textColor);
    const textBackgroundColor = useExportDiagramStore((state) => state.textBackgroundColor);
    const textOutlineColor = useExportDiagramStore((state) => state.textOutlineColor);
    const textBackgroundType = useExportDiagramStore((state) => state.textBackgroundType);
    const setFont = useExportDiagramStore((state) => state.setFont);
    const setTextSize = useExportDiagramStore((state) => state.setTextSize);
    const setTextOffset = useExportDiagramStore((state) => state.setTextOffset);
    const setTextColor = useExportDiagramStore((state) => state.setTextColor);
    const setTextBackgroundColor = useExportDiagramStore((state) => state.setTextBackgroundColor);
    const setTextOutlineColor = useExportDiagramStore((state) => state.setTextOutlineColor);
    const setTextBackgroundType = useExportDiagramStore((state) => state.setTextBackgroundType);

    return (
        <ConfigSection
            heading="Labels"
            className="mx-4">
            <div>
                <InputLabel>Variant</InputLabel>
                <ComboBox<TextBackgroundType>
                    id="export-text-background-type"
                    items={[
                        { key: "none", label: "Default" },
                        { key: "outline", label: "Outlined" },
                        { key: "box", label: "Boxed" },
                    ]}
                    selectedKey={textBackgroundType}
                    onKeySelectionChange={setTextBackgroundType} />
            </div>

            <div>
                <InputLabel>Font</InputLabel>
                <ComboBox<Font>
                    id="export-text-font"
                    items={[
                        { key: "Arial", label: "Arial" },
                        { key: "Times New Roman", label: "Times New Roman" },
                        { key: "Courier New", label: "Courier New" },
                    ]}
                    selectedKey={font}
                    onKeySelectionChange={setFont} />
            </div>

            <LabelLineInputs />

            <div
                className="grid grid-cols-2 gap-2">
                <DebouncedNumberInput
                    id="export-diagram-text-font-size"
                    delay={DEBOUNCE_DELAY}
                    label="Font size"
                    min={1}
                    value={textSize}
                    onChange={setTextSize} />
                <DebouncedNumberInput
                    id="export-diagram-text-offset"
                    delay={DEBOUNCE_DELAY}
                    label="Offset"
                    min={0}
                    value={textOffset}
                    onChange={setTextOffset} />
            </div>

            <div>
                <InputLabel>Color</InputLabel>
                <DebouncedColorInput
                    delay={DEBOUNCE_DELAY}
                    color={textColor}
                    onChange={setTextColor} />
            </div>
            {textBackgroundType !== "none" &&
                <div>
                    <InputLabel>{textBackgroundType === "outline" ? "Outline color" : "Background color"}</InputLabel>
                    <DebouncedColorInput
                        delay={DEBOUNCE_DELAY}
                        color={textBackgroundColor}
                        onChange={setTextBackgroundColor} />
                </div>}
            {textBackgroundType === "box" &&
                <div>
                    <InputLabel>Outline color</InputLabel>
                    <DebouncedColorInput
                        delay={DEBOUNCE_DELAY}
                        color={textOutlineColor}
                        onChange={setTextOutlineColor} />
                </div>}
        </ConfigSection>
    );
}