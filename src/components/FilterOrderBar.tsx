import { LuArrowDownUp, LuFilter } from "react-icons/lu";
import Button from "./inputs/Button";

export default function FilterOrderBar(props: {
    filterTitle?: string,
    sortTitle?: string,
}) {
    return (
        <div
            className="flex gap-1.5">
            <Button
                title={props.filterTitle || "Filter"}
                variant="icon-secondary"
                size="sm">
                <LuFilter />
            </Button>
            <Button
                title={props.sortTitle || "Sort"}
                variant="icon-secondary"
                size="sm">
                <LuArrowDownUp />
            </Button>
        </div>
    )
}