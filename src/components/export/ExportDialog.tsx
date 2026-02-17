import ComboBox from "../inputs/ComboBox";
import FormatsButton from "../formats/FormatsButton";
import FullscreenNavDialog from "../FullscreenNavDialog";
import { ExportItem } from "./types/ExportItem";
import { SelectedFormatStoreType } from "../../stores/export/types/SelectedFormatStoreType";
import InputLabel from "../inputs/InputLabel";
import Container from "../layouts/Container";

export default function ExportDialog<TKey extends string>(props: {
    route: string,
    items: Array<ExportItem<TKey>>,
    useSelectedFormatStore: SelectedFormatStoreType<TKey>,
    content?: React.ReactNode,
    onShowing?: () => void,
    onShown?: () => void,
    onHiding?: () => void,
    onHidden?: () => void,
}) {
    const selectedFormat = props.useSelectedFormatStore((state) => state.selectedFormat);
    const setSelectedFormat = props.useSelectedFormatStore((state) => state.setSelectedFormat);

    const selectedItem = props.items.find((item) => item.key === selectedFormat);

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
                    as="section"
                    className="flex flex-col gap-3 overflow-hidden">
                    <div
                        className="px-4 pt-4">
                        <InputLabel>
                            File format
                        </InputLabel>

                        <div
                            className="w-full flex gap-2">
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
                    </div>

                    <div
                        className="flex-1 overflow-y-auto thin-scrollbar">
                        {selectedItem?.options?.()}
                    </div>

                    {selectedItem?.buttons()}
                </Container>

                <Container
                    as="section"
                    className="relative xl:col-start-2 xl:-col-end-1 overflow-hidden">
                    {props.content || selectedItem?.content?.()}
                </Container>
            </div>
        </FullscreenNavDialog>
    );
}