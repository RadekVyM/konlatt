import { CsvSeparator } from "../types/CsvSeparator";
import { cn } from "../utils/tailwind";
import ComboBox from "./inputs/ComboBox";

export default function CsvSeparatorSelect(props: {
    id: string,
    className?: string,
    selectedCsvSeparator: CsvSeparator,
    onCsvSeparatorChange: (csvSeparator: CsvSeparator) => void,
}) {
    return (
        <ComboBox<CsvSeparator>
            id={props.id}
            className={cn("w-full", props.className)}
            items={[
                { key: ",", label: "," },
                { key: ";", label: ";" },
                { key: "|", label: "|" },
                { key: "\t", label: "Tab" },
            ]}
            selectedKey={props.selectedCsvSeparator}
            onKeySelectionChange={props.onCsvSeparatorChange} />
    );
}