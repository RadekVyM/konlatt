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
    const rasterWidth = useExportDiagramStore((state) => state.rasterWidth);
    const rasterHeight = useExportDiagramStore((state) => state.rasterHeight);
    const rasterLockedAspecRatio = useExportDiagramStore((state) => state.rasterLockedAspecRatio);
    const setRasterWidth = useExportDiagramStore((state) => state.setRasterWidth);
    const setRasterHeight = useExportDiagramStore((state) => state.setRasterHeight);
    const setRasterLockedAspecRatio = useExportDiagramStore((state) => state.setRasterLockedAspecRatio);

    return (
        <ConfigSection
            heading="Layout"
            className="mx-4">
            <div>
                <InputLabel>Template</InputLabel>
                <ComboBox<string>
                    id="layout-template"
                    items={[

                    ]}
                    selectedKey=""
                    onKeySelectionChange={() => {}}>
                </ComboBox>
            </div>
            <div>
                <InputLabel>Dimensions</InputLabel>
                <div
                    className="grid grid-cols-[1fr_1fr_auto_auto] gap-x-2">
                    {rasterLockedAspecRatio &&
                        <div
                            className="col-2 row-1 -ml-2.5 w-3 h-4 bg-surface-light-dim-container self-center aspect-ratio-bridge-clip">
                        </div>}
                    <DimensionInput
                        className="col-1 row-1"
                        prefix="W"
                        value={rasterWidth}
                        onChange={setRasterWidth} />
                    <DimensionInput
                        className="col-2 row-1"
                        prefix="H"
                        value={rasterHeight}
                        onChange={setRasterHeight} />
                    <Button
                        variant="icon-secondary"
                        size="sm"
                        className="h-full w-full col-3 row-1"
                        title={rasterLockedAspecRatio ? "Unlock the aspect ratio" : "Lock the aspect ratio"}
                        onClick={() => setRasterLockedAspecRatio((old) => !old)}>
                        {rasterLockedAspecRatio ? <LuLock /> : <LuLockOpen />}
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
        </ConfigSection>
    );
}

function DimensionInput(props: {
    className?: string,
    prefix: string,
    value: number,
    onChange: (value: number) => void,
}) {
    return (
        <NumberInput
            className={props.className}
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