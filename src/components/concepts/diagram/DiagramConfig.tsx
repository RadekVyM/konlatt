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
        <Section>
            <ToggleSwitch
                checked={cameraType === "3d"}
                onChange={(e) => setCameraType(e.currentTarget.checked ? "3d" : "2d")}>
                3D mode
            </ToggleSwitch>
            <ToggleSwitch
                checked={displayHighlightedSublatticeOnly}
                onChange={(e) => setDisplayHighlightedSublatticeOnly(e.currentTarget.checked)}>
                Display highlighted sublattice only
            </ToggleSwitch>
        </Section>
    );
}

function NodesLinksSection() {
    const linksVisibleEnabled = useDiagramStore((state) => state.linksVisibleEnabled);
    const hoveredLinksHighlightingEnabled = useDiagramStore((state) => state.hoveredLinksHighlightingEnabled);
    const semitransparentLinksEnabled = useDiagramStore((state) => state.semitransparentLinksEnabled);
    const labelsEnabled = useDiagramStore((state) => state.labelsEnabled);
    const flatLinksEnabled = useDiagramStore((state) => state.flatLinksEnabled);
    const setLinksVisibleEnabled = useDiagramStore((state) => state.setLinksVisibleEnabled);
    const setHoveredLinksHighlightingEnabled = useDiagramStore((state) => state.setHoveredLinksHighlightingEnabled);
    const setSemitransparentLinksEnabled = useDiagramStore((state) => state.setSemitransparentLinksEnabled);
    const setLabelsEnabled = useDiagramStore((state) => state.setLabelsEnabled);
    const setFlatLinksEnabled = useDiagramStore((state) => state.setFlatLinksEnabled);

    return (
        <Section
            heading="Nodes and links">
            <ToggleSwitch
                checked={labelsEnabled}
                onChange={(e) => setLabelsEnabled(e.currentTarget.checked)}>
                Show labels
            </ToggleSwitch>
            <ToggleSwitch
                checked={linksVisibleEnabled}
                onChange={(e) => setLinksVisibleEnabled(e.currentTarget.checked)}>
                Show links
            </ToggleSwitch>
            <ToggleSwitch
                checked={hoveredLinksHighlightingEnabled}
                onChange={(e) => setHoveredLinksHighlightingEnabled(e.currentTarget.checked)}>
                Highlight links on hover
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
        </Section>
    );
}

function LayoutSection() {
    const layoutMethod = useDiagramStore((state) => state.layoutMethod);
    const parallelizeReDraw = useDiagramStore((state) => state.parallelizeReDraw);
    const targetDimensionReDraw = useDiagramStore((state) => state.targetDimensionReDraw);
    const setLayoutMethod = useDiagramStore((state) => state.setLayoutMethod);
    const setParallelizeReDraw = useDiagramStore((state) => state.setParallelizeReDraw);
    const setTargetDimensionReDraw = useDiagramStore((state) => state.setTargetDimensionReDraw);

    return (
        <Section
            heading="Layout">
            <div>
                <label className="text-sm mb-1 block">Layout method</label>

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
        </Section>
    );
}

function PerformanceSection() {
    const antialiasEnabled = useDiagramStore((state) => state.antialiasEnabled);
    const movementRegressionEnabled = useDiagramStore((state) => state.movementRegressionEnabled);
    const setAntialiasEnabled = useDiagramStore((state) => state.setAntialiasEnabled);
    const setMovementRegressionEnabled = useDiagramStore((state) => state.setMovementRegressionEnabled);

    return (
        <Section
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
        </Section>
    );
}

function Section(props: {
    heading?: React.ReactNode,
    children?: React.ReactNode,
}) {
    return (
        <section
            className="mb-5 flex flex-col gap-2">
            {props.heading &&
                <h3
                    className="font-semibold">
                    {props.heading}
                </h3>}
            {props.children}
        </section>
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
            <label
                htmlFor={props.id}
                className="text-sm col-start-1 -col-end-1 w-fit">
                Seed
            </label>
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