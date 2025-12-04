import { LuLock, LuLockOpen, LuScaling } from "react-icons/lu";
import useDiagramStore from "../../stores/diagram/useDiagramStore";
import useExportDiagramStore from "../../stores/export/useExportDiagramStore";
import { DiagramExportFormat } from "../../types/export/DiagramExportFormat";
import Button from "../inputs/Button";
import ComboBox from "../inputs/ComboBox";
import InputLabel from "../inputs/InputLabel";
import NumberInput from "../inputs/NumberInput";
import ConfigSection from "../layouts/ConfigSection";
import ExportButton from "./ExportButton";
import ExportDiagramCanvas from "./ExportDiagramCanvas";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";
import ColorInput from "../inputs/ColorInput";
import "./aspect-ratio-bridge-clip.css";
import { cn } from "../../utils/tailwind";
import { DiagramExportDimensionsTemplateKey } from "../../types/export/DiagramExportDimensionsTemplate";
import { DropDownMenuItem } from "../inputs/DropDownMenu";
import { EXPORT_DIMENSIONS_TEMPLATES } from "../../constants/diagramExport";

const ITEMS: Array<ExportItem<DiagramExportFormat>> = [
    {
        key: "svg",
        label: "SVG",
        buttons: () => <></>,
        options: () => <PictureOptions />
    },
];

export default function ExportDiagramButton(props: ExportButtonProps) {
    const layout = useDiagramStore((state) => state.layout);

    return (
        <ExportButton<DiagramExportFormat>
            {...props}
            disabled={!layout}
            items={ITEMS}
            isHighlighted
            useSelectedFormatStore={useExportDiagramStore}
            content={<ExportDiagramCanvas />} />
    );
}

function PictureOptions() {
    return (
        <>
            <LayoutSection />

            <AppearanceSection />
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
                    Background
                </InputLabel>
                <ColorInput
                    color={backgroundColor}
                    onChange={setBackgroundColor} />
            </div>
            <div>
                <InputLabel>
                    Default node color
                </InputLabel>
                <ColorInput
                    color={defaultNodeColor}
                    onChange={setDefaultNodeColor} />
            </div>
            <div>
                <InputLabel>
                    Default link color
                </InputLabel>
                <ColorInput
                    color={defaultLinkColor}
                    onChange={setDefaultLinkColor} />
            </div>
            <NumberInput
                label="Node radius"
                value={nodeRadius}
                onChange={setNodeRadius}
                min={1} />
            <NumberInput
                label="Link thickness"
                value={linkThickness}
                onChange={setLinkThickness}
                min={1} />
        </ConfigSection>
    );
}

function LayoutSection() {
    return (
        <ConfigSection
            heading="Layout"
            className="mx-4">
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

                    console.log(template)

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
                className="grid grid-cols-[1fr_1fr_auto_auto] gap-x-2">
                {maxDimensionsLockedAspecRatio &&
                    <div
                        className="col-2 row-1 -ml-2.5 w-3 h-4 bg-surface-light-dim-container self-center aspect-ratio-bridge-clip">
                    </div>}
                <PrefixedNumberInput
                    className="col-1 row-1"
                    prefix="W"
                    value={maxWidth}
                    onChange={setMaxWidth} />
                <PrefixedNumberInput
                    className="col-2 row-1"
                    prefix="H"
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
                <Button
                    variant="icon-secondary"
                    size="sm"
                    className="h-full w-full row-1"
                    title="Adjust to diagram">
                    <LuScaling />
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
                <PrefixedNumberInput
                    className="col-1 row-1"
                    prefix="L"
                    value={minPaddingLeft}
                    onChange={setMinPaddingLeft} />
                <PrefixedNumberInput
                    className="col-2 row-1"
                    prefix="R"
                    value={minPaddingRight}
                    onChange={setMinPaddingRight} />
                <PrefixedNumberInput
                    className="col-1 row-2"
                    prefix="T"
                    value={minPaddingTop}
                    onChange={setMinPaddingTop} />
                <PrefixedNumberInput
                    className="col-2 row-2"
                    prefix="B"
                    value={minPaddingBottom}
                    onChange={setMinPaddingBottom} />
            </div>
        </div>
    );
}

function PrefixedNumberInput(props: {
    className?: string,
    prefix: string,
    value: number,
    onChange: (value: number) => void,
}) {
    return (
        <NumberInput
            className={props.className}
            min={0}
            inputClassName="pl-7"
            value={props.value}
            onChange={props.onChange}>
            <span
                className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-on-surface-container-muted pointer-events-none">
                {props.prefix}
            </span>
        </NumberInput>
    );
}