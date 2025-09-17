import { DialogState } from "../types/DialogState";
import ContentDialog from "./ContentDialog";
import { useNavigate } from "react-router-dom";
import DIGITS_URL from "../assets/datasets/digits.cxt?url"
import GEWAESSER_URL from "../assets/datasets/gewaesser.cxt?url"
import LATTICE_URL from "../assets/datasets/lattice.cxt?url"
import LIVEINWATER_URL from "../assets/datasets/liveinwater.cxt?url"
import TEALADY_URL from "../assets/datasets/tealady.cxt?url"
import Button from "./inputs/Button";
import { triggerInitialization } from "../services/triggers";
import { cn } from "../utils/tailwind";
import { useState } from "react";
import toast from "./toast";

type Dataset = {
    name: string,
    url: string,
    attributes: Array<string>,
}

const DATASETS: Array<Dataset> = [
    {
        name: "Digits",
        url: DIGITS_URL,
        attributes: ["10 objects", "7 attributes", "48 concepts"],
    },
    {
        name: "Bodies of water",
        url: GEWAESSER_URL,
        attributes: ["8 objects", "6 attributes", "28 concepts"],
    },
    {
        name: "Lattice properties",
        url: LATTICE_URL,
        attributes: ["14 objects", "16 attributes", "24 concepts"],
    },
    {
        name: "Live in water",
        url: LIVEINWATER_URL,
        attributes: ["8 objects", "9 attributes", "19 concepts"],
    },
    {
        name: "Tea ladies",
        url: TEALADY_URL,
        attributes: ["18 objects", "14 attributes", "65 concepts"],
    },
];

export default function DemoDatasetsDialog(props: {
    state: DialogState,
}) {
    const [disabled, setDisabled] = useState(false);
    const navigate = useNavigate();

    async function onDatasetClick(dataset: Dataset) {
        let text: string;

        setDisabled(true);

        try {
            const response = await fetch(dataset.url);
            text = await response.text();
        }
        catch (e) {
            console.error(e);
            toast("Dataset could not be downloaded.");
            await props.state.hide();
            setDisabled(false);
            return;
        }

        triggerInitialization(
            text,
            "burmeister",
            null,
            dataset.name,
            async () => {
                navigate("/project/context", { replace: true });
                setDisabled(false);
                await props.state.hide();
            },
            () => setDisabled(false));
    }

    return (
        <ContentDialog
            ref={props.state.dialogRef}
            state={props.state}
            heading="Demonstration datasets"
            className="w-full max-w-xl max-h-full rounded-md">
            <div
                className="pt-2 flex flex-col">
                <ul
                    className="flex flex-col mb-4">
                    {DATASETS.map((dataset, index) =>
                        <li
                            key={index}
                            className={cn(
                                "py-0.5",
                                index < DATASETS.length - 1 && "border-b border-outline-variant")}>
                            <Button
                                className="w-full text-start py-2"
                                onClick={async () => await onDatasetClick(dataset)}
                                disabled={disabled}>
                                <div>
                                    <h3
                                        className="font-semibold mb-1">
                                        {dataset.name}
                                    </h3>
                                    <ul
                                        className="flex items-center gap-1">
                                        {dataset.attributes.map((attribute) =>
                                            <li
                                                key={attribute}
                                                className="bg-primary-lite text-primary text-xs rounded-md px-1.5">
                                                {attribute}
                                            </li>)}
                                    </ul>
                                </div>
                            </Button>
                        </li>)}
                </ul>

                <a
                    className="self-end text-sm text-on-surface-muted hover:underline hover:text-primary transition-colors"
                    href="https://upriss.github.io/fca/examples.html">
                    Source
                </a>
            </div>
        </ContentDialog>
    );
}