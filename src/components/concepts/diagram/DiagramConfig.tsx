import { useState } from "react";
import ComboBox from "../../inputs/ComboBox";
import ToggleSwitch from "../../inputs/ToggleSwitch";
import NumberInput from "../../inputs/NumberInput";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { LayoutMethod } from "../../../types/LayoutMethod";

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
    const setLayoutMethod = useDiagramStore((state) => state.setLayoutMethod);

    const [horizontalNodesDistance, setHorizontalNodesDistance] = useState<number>(1);
    const [verticalNodesDistance, setVerticalNodesDistance] = useState<number>(1);

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

            <NumberInput
                label="Vertical nodes distance"
                id="vertical-nodes-distance"
                placeholder="1"
                min={0.5}
                step={0.5}
                minimumFractionDigits={1}
                value={verticalNodesDistance}
                onChange={setVerticalNodesDistance} />

            <NumberInput
                label="Horizontal nodes distance"
                id="horizontal-nodes-distance"
                placeholder="1"
                min={0.5}
                step={0.5}
                minimumFractionDigits={1}
                value={horizontalNodesDistance}
                onChange={setHorizontalNodesDistance} />
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