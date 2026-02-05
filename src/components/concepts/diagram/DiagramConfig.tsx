import { useRef, useState } from "react";
import ComboBox from "../../inputs/ComboBox";
import ToggleSwitch from "../../inputs/ToggleSwitch";
import NumberInput from "../../inputs/NumberInput";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { LayoutMethod } from "../../../types/LayoutMethod";
import useDebouncedSetter from "../../../hooks/useDebouncedSetter";
import Input from "../../inputs/Input";
import { MAX_SEED_LENGTH_REDRAW } from "../../../constants/diagram";
import { generateRandomSeed, isNullOrWhiteSpace } from "../../../utils/string";
import { cn } from "../../../utils/tailwind";
import Button from "../../inputs/Button";
import { LuRefreshCcw } from "react-icons/lu";
import AngleSlider from "./AngleSlider";
import { LayeredLayoutPlacement } from "../../../types/LayeredLayoutPlacement";
import InputLabel from "../../inputs/InputLabel";
import ConfigSection from "../../layouts/ConfigSection";

const INPUT_DELAY = 500;

export default function DiagramConfig() {
    return (
        <>
            <header
                className="mb-1 flex flex-col">
                <h2
                    className="mx-4 mb-2 text-lg font-semibold">
                    Configuration
                </h2>
            </header>

            <div
                className="flex-1 overflow-y-auto px-4 pb-4 thin-scrollbar">
                <DisplaySection />

                <LayoutSection />

                <LabelsSection />

                <NodesLinksSection />

                <PerformanceSection />
            </div>
        </>
    );
}

function DisplaySection() {
    const displayHighlightedSublatticeOnly = useDiagramStore((state) => state.displayHighlightedSublatticeOnly);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const setDisplayHighlightedSublatticeOnly = useDiagramStore((state) => state.setDisplayHighlightedSublatticeOnly);
    const setCameraType = useDiagramStore((state) => state.setCameraType);

    return (
        <ConfigSection>
            <ToggleSwitch
                checked={cameraType === "3d"}
                onChange={(e) => setCameraType(e.currentTarget.checked ? "3d" : "2d")}>
                3D mode
            </ToggleSwitch>
            <ToggleSwitch
                checked={displayHighlightedSublatticeOnly}
                onChange={(e) => setDisplayHighlightedSublatticeOnly(e.currentTarget.checked)}>
                Show highlighted sublattice only
            </ToggleSwitch>
        </ConfigSection>
    );
}

function LabelsSection() {
    const labelsEnabled = useDiagramStore((state) => state.labelsEnabled);
    const hoveredConceptDetailEnabled = useDiagramStore((state) => state.hoveredConceptDetailEnabled);
    const recalculateLabelingOfSublatticeOnly = useDiagramStore((state) => state.recalculateLabelingOfSublatticeOnly);
    const setLabelsEnabled = useDiagramStore((state) => state.setLabelsEnabled);
    const setHoveredConceptDetailEnabled = useDiagramStore((state) => state.setHoveredConceptDetailEnabled);
    const setRecalculateLabelingOfSublatticeOnly = useDiagramStore((state) => state.setRecalculateLabelingOfSublatticeOnly);

    return (
        <ConfigSection
            heading="Labeling">
            <ToggleSwitch
                checked={hoveredConceptDetailEnabled}
                onChange={(e) => setHoveredConceptDetailEnabled(e.currentTarget.checked)}>
                Show concept detail on hover
            </ToggleSwitch>
            <ToggleSwitch
                checked={labelsEnabled}
                onChange={(e) => setLabelsEnabled(e.currentTarget.checked)}>
                Show labeling
            </ToggleSwitch>
            <ToggleSwitch
                checked={recalculateLabelingOfSublatticeOnly}
                onChange={(e) => setRecalculateLabelingOfSublatticeOnly(e.currentTarget.checked)}>
                Recalculate labeling of sublattices
            </ToggleSwitch>
        </ConfigSection>
    );
}

function NodesLinksSection() {
    const linksVisibleEnabled = useDiagramStore((state) => state.linksVisibleEnabled);
    const hoveredLinksHighlightingEnabled = useDiagramStore((state) => state.hoveredLinksHighlightingEnabled);
    const selectedLinksHighlightingEnabled = useDiagramStore((state) => state.selectedLinksHighlightingEnabled);
    const semitransparentLinksEnabled = useDiagramStore((state) => state.semitransparentLinksEnabled);
    const flatLinksEnabled = useDiagramStore((state) => state.flatLinksEnabled);
    const setLinksVisibleEnabled = useDiagramStore((state) => state.setLinksVisibleEnabled);
    const setHoveredLinksHighlightingEnabled = useDiagramStore((state) => state.setHoveredLinksHighlightingEnabled);
    const setSelectedLinksHighlightingEnabled = useDiagramStore((state) => state.setSelectedLinksHighlightingEnabled);
    const setSemitransparentLinksEnabled = useDiagramStore((state) => state.setSemitransparentLinksEnabled);
    const setFlatLinksEnabled = useDiagramStore((state) => state.setFlatLinksEnabled);

    return (
        <ConfigSection
            heading="Nodes and links">
            <ToggleSwitch
                checked={linksVisibleEnabled}
                onChange={(e) => setLinksVisibleEnabled(e.currentTarget.checked)}>
                Show links
            </ToggleSwitch>
            <ToggleSwitch
                checked={semitransparentLinksEnabled}
                onChange={(e) => setSemitransparentLinksEnabled(e.currentTarget.checked)}>
                Semitransparent links
            </ToggleSwitch>
            <ToggleSwitch
                checked={flatLinksEnabled}
                onChange={(e) => setFlatLinksEnabled(e.currentTarget.checked)}>
                Flat links
            </ToggleSwitch>
            <ToggleSwitch
                checked={selectedLinksHighlightingEnabled}
                onChange={(e) => setSelectedLinksHighlightingEnabled(e.currentTarget.checked)}>
                Highlight links of selected concept
            </ToggleSwitch>
            <ToggleSwitch
                checked={hoveredLinksHighlightingEnabled}
                onChange={(e) => setHoveredLinksHighlightingEnabled(e.currentTarget.checked)}>
                Highlight links on hover
            </ToggleSwitch>
        </ConfigSection>
    );
}

function LayoutSection() {
    const layoutMethod = useDiagramStore((state) => state.layoutMethod);
    const placementLayered = useDiagramStore((state) => state.placementLayered);
    const parallelizeReDraw = useDiagramStore((state) => state.parallelizeReDraw);
    const targetDimensionReDraw = useDiagramStore((state) => state.targetDimensionReDraw);
    const setLayoutMethod = useDiagramStore((state) => state.setLayoutMethod);
    const setPlacementLayered = useDiagramStore((state) => state.setPlacementLayered);
    const setParallelizeReDraw = useDiagramStore((state) => state.setParallelizeReDraw);
    const setTargetDimensionReDraw = useDiagramStore((state) => state.setTargetDimensionReDraw);

    return (
        <ConfigSection
            heading="Layout">
            <div>
                <InputLabel>Layout method</InputLabel>

                <ComboBox<LayoutMethod>
                    id="diagram-layout-method"
                    items={[
                        { key: "layered", label: "Layered" },
                        { key: "freese", label: "Freese" },
                        { key: "redraw", label: "ReDraw" },
                    ]}
                    selectedKey={layoutMethod}
                    onKeySelectionChange={setLayoutMethod} />
            </div>

            {layoutMethod === "layered" &&
                <div>
                    <InputLabel>Horizontal placement</InputLabel>

                    <ComboBox<LayeredLayoutPlacement>
                        id="diagram-layout-layered-placement"
                        items={[
                            { key: "simple", label: "Evenly spaced and centered" },
                            { key: "ellipse", label: "Evenly spaced in an ellipse" },
                            { key: "bk", label: "Brandes and Köpf" },
                        ]}
                        selectedKey={placementLayered}
                        onKeySelectionChange={setPlacementLayered} />
                </div>}

            {layoutMethod === "redraw" &&
                <>
                    <SeedReDrawInput
                        id="redraw-seed" />

                    <ToggleSwitch
                        className="mt-1.5"
                        checked={parallelizeReDraw}
                        onChange={(e) => setParallelizeReDraw(e.currentTarget.checked)}>
                        Parallelize links
                    </ToggleSwitch>
                    <ToggleSwitch
                        checked={targetDimensionReDraw === 3}
                        onChange={(e) => setTargetDimensionReDraw(e.currentTarget.checked ? 3 : 2)}>
                        Reduce to 3D
                    </ToggleSwitch>
                </>}

            <ScaleInputs />

            <RotationInput />
        </ConfigSection>
    );
}

function PerformanceSection() {
    const antialiasEnabled = useDiagramStore((state) => state.antialiasEnabled);
    const movementRegressionEnabled = useDiagramStore((state) => state.movementRegressionEnabled);
    const setAntialiasEnabled = useDiagramStore((state) => state.setAntialiasEnabled);
    const setMovementRegressionEnabled = useDiagramStore((state) => state.setMovementRegressionEnabled);

    return (
        <ConfigSection
            heading="Performance">
            <ToggleSwitch
                checked={antialiasEnabled}
                onChange={(e) => setAntialiasEnabled(e.currentTarget.checked)}>
                Smooth edges (antialiasing)
            </ToggleSwitch>
            <ToggleSwitch
                checked={movementRegressionEnabled}
                onChange={(e) => setMovementRegressionEnabled(e.currentTarget.checked)}>
                Movement regression
            </ToggleSwitch>
        </ConfigSection>
    );
}

function ScaleInputs() {
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const setHorizontalScale = useDiagramStore((state) => state.setHorizontalScale);
    const setVerticalScale = useDiagramStore((state) => state.setVerticalScale);

    const [horizontalScaleInput, setHorizontalScaleInput] = useState<number>(horizontalScale);
    const [verticalScaleInput, setVerticalScaleInput] = useState<number>(verticalScale);

    useDebouncedSetter(horizontalScaleInput, setHorizontalScale, INPUT_DELAY);
    useDebouncedSetter(verticalScaleInput, setVerticalScale, INPUT_DELAY);

    return (
        <>
            <NumberInput
                label="Vertical nodes distance"
                id="vertical-nodes-distance"
                placeholder="1"
                min={0.5}
                step={0.5}
                minimumFractionDigits={1}
                value={verticalScaleInput}
                onChange={setVerticalScaleInput} />

            <NumberInput
                label="Horizontal nodes distance"
                id="horizontal-nodes-distance"
                placeholder="1"
                min={0.5}
                step={0.5}
                minimumFractionDigits={1}
                value={horizontalScaleInput}
                onChange={setHorizontalScaleInput} />
        </>
    );
}

function RotationInput() {
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);
    const setRotationDegrees = useDiagramStore((state) => state.setRotationDegrees);

    const [rotationDegreesInput, setRotationDegreesInput] = useState<number>(rotationDegrees);

    useDebouncedSetter(rotationDegreesInput, setRotationDegrees, INPUT_DELAY);

    return (
        <div>
            <NumberInput
                label="Rotation"
                id="diagram-rotation"
                className="mb-2"
                placeholder="1"
                min={-180}
                max={180}
                step={1}
                value={rotationDegreesInput}
                onChange={setRotationDegreesInput} />

            <AngleSlider
                id="rotation-degrees"
                value={rotationDegreesInput}
                onChange={setRotationDegreesInput} />
        </div>
    );
}

function SeedReDrawInput(props: {
    className?: string,
    id?: string,
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const seedReDraw = useDiagramStore((state) => state.seedReDraw);
    const setSeedReDraw = useDiagramStore((state) => state.setSeedReDraw);

    const [seedReDrawInput, setSeedReDrawInput] = useState<string>(seedReDraw);

    const seedToSave = isNullOrWhiteSpace(seedReDrawInput) ? seedReDraw : seedReDrawInput;

    useDebouncedSetter(seedToSave, setSeedReDraw, INPUT_DELAY);

    return (
        <div
            className={cn("grid grid-rows-[auto_auto] grid-cols-[1fr_auto] gap-x-2", props.className)}>
            <InputLabel
                htmlFor={props.id}
                className="col-start-1 -col-end-1 w-fit">
                Seed
            </InputLabel>
            <Input
                ref={inputRef}
                id={props.id}
                value={seedReDrawInput}
                onChange={(event) => setSeedReDrawInput(event.target.value)}
                onFocus={(event) => event.target.select()}
                onBlur={() => {
                    if (inputRef.current && isNullOrWhiteSpace(inputRef.current.value)) {
                        inputRef.current.value = seedReDraw;
                    }
                }}
                size={1}
                minLength={1}
                maxLength={MAX_SEED_LENGTH_REDRAW}
                className={"w-full"} />

            <Button
                variant="icon-secondary"
                size="sm"
                className="h-full w-full"
                title="Generate random seed"
                onClick={() => setSeedReDrawInput(generateRandomSeed(MAX_SEED_LENGTH_REDRAW))}>
                <LuRefreshCcw />
            </Button>
        </div>
    );
}