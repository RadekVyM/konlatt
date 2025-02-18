import { LuArrowDownUp, LuFilter } from "react-icons/lu";
import Button from "./inputs/Button";

export default function FilterOrderBar() {
    return (
        <div
            className="flex gap-1.5">
            <Button
                title="Filter concepts"
                variant="icon-secondary"
                size="sm">
                <LuFilter />
            </Button>
            <Button
                title="Sort concepts"
                variant="icon-secondary"
                size="sm">
                <LuArrowDownUp />
            </Button>
        </div>
    )
}