import { useEffect, useState } from "react";
import useDialog from "../../hooks/useDialog";
import ContentDialog from "../ContentDialog";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "../Container";
import ComboBox from "../inputs/ComboBox";
import Button from "../inputs/Button";
import { LuCopy, LuDownload } from "react-icons/lu";
import FormatsButton from "../formats/FormatsButton";
import useDiagramStore from "../../stores/diagram/useDiagramStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";

const DEFAULT_FORMAT = "json";
const FORMATS: Array<{ key: string, label: string }> = [
    { key: "json", label: "JSON" },
    { key: "xml", label: "XML" },
    { key: "csv", label: "CSV" },
];

export default function ExportDialog(props: {
    route: string,
}) {
    const [selectedFormat, setSelectedFormat] = useState<string>(DEFAULT_FORMAT);
    const dialogState = useDialog();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const isExport = location.pathname.endsWith(props.route);

        if (!dialogState.isOpen && isExport) {
            dialogState.show();
        }
        if (dialogState.isOpen && !isExport) {
            dialogState.hide().then();
        }
    }, [location.pathname, dialogState.isOpen, props.route]);

    return (
        <ContentDialog
            ref={dialogState.dialogRef}
            state={dialogState}
            heading="Export"
            className="fullscreen-dialog-content w-full h-full rounded-none bg-surface"
            outerClassName="fullscreen-dialog p-0 backdrop:backdrop-blur-none"
            notHideOnSubsequentLoads={true}
            onCloseClick={() => navigate(-1)}>
            <div
                className="pt-2 flex-1 flex flex-col gap-3">
                <div
                    className="flex justify-between gap-3">
                    <div
                        className="w-full flex-1 flex gap-2">
                        <ComboBox
                            id={`${props.route}-format`}
                            className="w-full max-w-72"
                            items={FORMATS}
                            selectedKey={selectedFormat}
                            onKeySelectionChange={setSelectedFormat} />

                        <FormatsButton />
                    </div>
                    
                    <div
                        className="flex gap-3">
                        <Button
                            variant="container"
                            onClick={() => console.log(serializeLayoutJson())}>
                            <LuCopy />
                            Copy
                        </Button>
                        <Button
                            variant="primary">
                            <LuDownload />
                            Download
                        </Button>
                    </div>
                </div>

                <Container
                    as="section"
                    className="flex-1">
                    {props.route}
                </Container>
            </div>
        </ContentDialog>
    );
}

function serializeLayoutJson() {
    const layout = useDiagramStore.getState().layout;
    const lattice = useDataStructuresStore.getState().lattice;

    if (!layout || !lattice) {
        return "";
    }

    const nodes = new Array<[number, number]>();
    const links = new Array<[number, number]>();

    for (let conceptIndex = 0; conceptIndex < lattice.subconceptsMapping.length; conceptIndex++) {
        const point = layout[conceptIndex];
        nodes.push([point.x, point.y]);

        for (const subconceptIndex of lattice.subconceptsMapping[conceptIndex]) {
            links.push([conceptIndex, subconceptIndex]);
        }
    }

    return JSON.stringify({
        nodes,
        links,
    });
}