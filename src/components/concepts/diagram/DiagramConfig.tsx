import { useState } from "react";
import ComboBox from "../../inputs/ComboBox";
import ToggleSwitch from "../../inputs/ToggleSwitch";
import NumberInput from "../../inputs/NumberInput";
import useDiagramStore from "../../../stores/useDiagramStore";

export default function DiagramConfig() {
    const [selectedLayoutMethod, setSelectedLayoutMethod] = useState<string>("layered");
    const [horizontalNodesDistance, setHorizontalNodesDistance] = useState<number>(1);
    const [verticalNodesDistance, setVerticalNodesDistance] = useState<number>(1);
    const displayHighlightedSublatticeOnly = useDiagramStore((state) => state.displayHighlightedSublatticeOnly);
    const cameraType = useDiagramStore((state) => state.cameraType);
    const linksVisibleEnabled = useDiagramStore((state) => state.linksVisibleEnabled);
    const semitransparentLinksEnabled = useDiagramStore((state) => state.semitransparentLinksEnabled);
    const antialiasEnabled = useDiagramStore((state) => state.antialiasEnabled);
    const labelsEnabled = useDiagramStore((state) => state.labelsEnabled);
    const setDisplayHighlightedSublatticeOnly = useDiagramStore((state) => state.setDisplayHighlightedSublatticeOnly);
    const setCameraType = useDiagramStore((state) => state.setCameraType);
    const setLinksVisibleEnabled = useDiagramStore((state) => state.setLinksVisibleEnabled);
    const setSemitransparentLinksEnabled = useDiagramStore((state) => state.setSemitransparentLinksEnabled);
    const setAntialiasEnabled = useDiagramStore((state) => state.setAntialiasEnabled);
    const setLabelsEnabled = useDiagramStore((state) => state.setLabelsEnabled);

    return (
        <>
            <header
                className="pb-3 flex flex-col">
                <h2
                    className="mx-4 mb-2 text-lg font-semibold">
                    Configuration
                </h2>
            </header>

            <div
                className="flex-1 overflow-y-auto px-4 pb-4 thin-scrollbar">
                <section
                    className="mb-4 flex flex-col gap-2">
                    <ToggleSwitch
                        checked={displayHighlightedSublatticeOnly}
                        onChange={(e) => setDisplayHighlightedSublatticeOnly(e.currentTarget.checked)}>
                        Display highlighted sublattice only
                    </ToggleSwitch>
                    <ToggleSwitch
                        checked={cameraType === "3d"}
                        onChange={(e) => setCameraType(e.currentTarget.checked ? "3d" : "2d")}>
                        3D mode
                    </ToggleSwitch>
                    <ToggleSwitch
                        checked={linksVisibleEnabled}
                        onChange={(e) => setLinksVisibleEnabled(e.currentTarget.checked)}>
                        Links visible
                    </ToggleSwitch>
                    <ToggleSwitch
                        checked={semitransparentLinksEnabled}
                        onChange={(e) => setSemitransparentLinksEnabled(e.currentTarget.checked)}>
                        Semitransparent links
                    </ToggleSwitch>
                    <ToggleSwitch
                        checked={labelsEnabled}
                        onChange={(e) => setLabelsEnabled(e.currentTarget.checked)}>
                        Labels
                    </ToggleSwitch>
                    <ToggleSwitch
                        checked={antialiasEnabled}
                        onChange={(e) => setAntialiasEnabled(e.currentTarget.checked)}>
                        Smooth edges (antialiasing)
                    </ToggleSwitch>
                </section>

                <label className="text-sm mb-1 block">Layout method</label>

                <ComboBox
                    className="mb-4"
                    id="diagram-layout-method"
                    items={[
                        { key: "layered", label: "Layered" },
                        { key: "freese", label: "Freese" },
                        { key: "redraw", label: "ReDraw" },
                    ]}
                    selectedKey={selectedLayoutMethod}
                    onKeySelectionChange={setSelectedLayoutMethod} />

                <NumberInput
                    className="mb-2"
                    label="Vertical nodes distance"
                    placeholder="1"
                    min={0.5}
                    step={0.5}
                    minimumFractionDigits={1}
                    value={verticalNodesDistance}
                    onChange={setVerticalNodesDistance} />

                <NumberInput
                    label="Horizontal nodes distance"
                    placeholder="1"
                    min={0.5}
                    step={0.5}
                    minimumFractionDigits={1}
                    value={horizontalNodesDistance}
                    onChange={setHorizontalNodesDistance} />
            </div>
        </>
    );
}