import { useState } from "react";
import ComboBox from "../inputs/ComboBox";
import ToggleSwitch from "../inputs/ToggleSwitch";
import NumberInput from "../inputs/NumberInput";

export default function DiagramConfig() {
    const [selectedLayoutMethod, setSelectedLayoutMethod] = useState<string>("layered");
    const [horizontalNodesDistance, setHorizontalNodesDistance] = useState<number>(1);
    const [verticalNodesDistance, setVerticalNodesDistance] = useState<number>(1);

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
                className="flex-1 overflow-y-auto px-4">
                <ToggleSwitch
                    className="mb-4">
                    Display highlighted sublattice only
                </ToggleSwitch>

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