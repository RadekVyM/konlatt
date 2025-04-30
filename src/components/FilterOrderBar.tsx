import { LuArrowDownUp, LuFilter } from "react-icons/lu";
import Button from "./inputs/Button";

export default function FilterOrderBar(props: {
    filterTitle?: string,
    sortTitle?: string,
    disabled?: boolean,
}) {
    return (
        <div
            className="flex gap-1.5">
            <Button
                title={props.filterTitle || "Filter"}
                variant="icon-secondary"
                size="sm"
                disabled={props.disabled}>
                <LuFilter />
            </Button>
            <Button
                title={props.sortTitle || "Sort"}
                variant="icon-secondary"
                size="sm"
                disabled={props.disabled}>
                <LuArrowDownUp />
            </Button>
        </div>
    )
}