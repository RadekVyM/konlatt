import Container from "../Container";
import ComboBox from "../inputs/ComboBox";
import Button from "../inputs/Button";
import { LuCopy, LuDownload } from "react-icons/lu";
import FormatsButton from "../formats/FormatsButton";
import FullscreenNavDialog from "../FullscreenNavDialog";
import { ExportItem } from "./types/ExportItem";
import { SelectedFormatStoreType } from "../../stores/export/types/SelectedFormatStoreType";

export default function ExportDialog<TKey extends string>(props: {
    route: string,
    items: Array<ExportItem<TKey>>,
    useSelectedFormatStore: SelectedFormatStoreType<TKey>,
    onShowing?: () => void,
    onShown?: () => void,
    onHiding?: () => void,
    onHidden?: () => void,
}) {
    const selectedFormat = props.useSelectedFormatStore((state) => state.selectedFormat);
    const setSelectedFormat = props.useSelectedFormatStore((state) => state.setSelectedFormat);

    return (
        <FullscreenNavDialog
            route={props.route}
            heading="Export"
            onShowing={props.onShowing}
            onShown={props.onShown}
            onHiding={props.onHiding}
            onHidden={props.onHidden}>
            <div
                className="
                    flex-1 overflow-hidden
                    grid grid-rows-[4fr_5fr] md:grid-rows-1 md:grid-cols-[minmax(18rem,2fr)_5fr] xl:grid-cols-[1fr_2.5fr_1fr] gap-2
                    pt-2 -mx-2 px-2 -mb-2 pb-2">
                <Container
                    className="flex flex-col gap-3">
                    <div
                        className="w-full flex gap-2 p-4">
                        <ComboBox<TKey>
                            id={`${props.route}-format`}
                            className="w-full"
                            items={props.items.map((item) => ({
                                key: item.key,
                                label: item.label,
                            }))}
                            selectedKey={selectedFormat}
                            onKeySelectionChange={setSelectedFormat} />

                        <FormatsButton />
                    </div>

                    <div
                        className="flex-1">
                        {props.items.find((item) => item.key === selectedFormat)?.options?.()}
                    </div>

                    <div
                        className="grid grid-cols-2 gap-2 p-4">
                        <Button
                            variant="container"
                            size="lg"
                            className="w-full justify-center">
                            <LuCopy />
                            Copy
                        </Button>
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full justify-center">
                            <LuDownload />
                            Download
                        </Button>
                    </div>
                </Container>

                <Container
                    as="section"
                    className="xl:col-start-2 xl:-col-end-1 overflow-hidden">
                    {props.items.find((item) => item.key === selectedFormat)?.content()}
                </Container>
            </div>
        </FullscreenNavDialog>
    );
}