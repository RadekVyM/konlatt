import { useEffect } from "react";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";

export default function Grid() {
    const conceptsToMoveBox = useDiagramStore((state) => state.conceptsToMoveBox);

    useEffect(() => {
        console.log(conceptsToMoveBox)
    }, [conceptsToMoveBox]);

    return undefined;
}