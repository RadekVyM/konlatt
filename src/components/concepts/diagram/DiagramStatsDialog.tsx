import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import { DialogState } from "../../../types/DialogState";
import { cn } from "../../../utils/tailwind";
import ContentDialog from "../../ContentDialog";

/**
 * Dialog component that shows basic statistics about the diagram.
*/
export default function DiagramStatsDialog(props: {
    state: DialogState,
}) {
    return (
        <ContentDialog
            ref={props.state.dialogRef}
            className="max-w-md max-h-[30rem] overflow-hidden p-0"
            headerClassName="px-5"
            state={props.state}
            heading={"Statistics"}>
            {props.state.isOpen &&
                <Content />}
        </ContentDialog>
    );
}

function Content() {
    const concepts = useDataStructuresStore((state) => state.concepts);
    const subconceptsRelation = useDataStructuresStore((state) => state.lattice?.subconceptsRelation);
    const displayHighlightedSublatticeOnly = useDiagramStore((state) => state.displayHighlightedSublatticeOnly);
    const sublatticeConceptIndexes = useDiagramStore((state) => state.sublatticeConceptIndexes);
    const filteredConceptIndexes = useDiagramStore((state) => state.filteredConceptIndexes);

    let filteredSublatticeConceptsCount = 0;
    let linksCount = 0;
    let sublatticeLinksCount = 0;
    let filteredLinks = 0;

    if (subconceptsRelation) {
        for (let conceptIndex = 0; conceptIndex < subconceptsRelation.length; conceptIndex++) {
            const subconcepts = subconceptsRelation[conceptIndex];
            linksCount += subconcepts.size;

            for (const subconcept of subconcepts) {
                const isSublatticeLink = sublatticeConceptIndexes?.has(conceptIndex) &&
                    sublatticeConceptIndexes?.has(subconcept);
                const isFilteredLink = filteredConceptIndexes?.has(conceptIndex) &&
                    filteredConceptIndexes?.has(subconcept);

                if (isSublatticeLink) {
                    sublatticeLinksCount++;
                }
                if (sublatticeConceptIndexes !== null && displayHighlightedSublatticeOnly ?
                        isFilteredLink && isSublatticeLink :
                        isFilteredLink) {
                    filteredLinks++;
                }
            }

            if (sublatticeConceptIndexes?.has(conceptIndex) && filteredConceptIndexes?.has(conceptIndex)) {
                filteredSublatticeConceptsCount++;
            }
        }
    }

    const stats: ReadonlyArray<{ title: string, value?: number | boolean, }> = [
        { title: "Concepts", value: concepts?.length },
        { title: "Sublattice concepts", value: sublatticeConceptIndexes !== null && sublatticeConceptIndexes.size },
        { title: "Filtered concepts", value: filteredConceptIndexes !== null && filteredConceptIndexes.size },
        { title: "Filtered sublattice concepts", value: sublatticeConceptIndexes !== null && filteredConceptIndexes !== null &&
            filteredSublatticeConceptsCount },
        { title: "Links", value: concepts !== null && linksCount },
        { title: "Sublattice links", value: sublatticeConceptIndexes !== null && sublatticeLinksCount },
        { title: "Highlighted links", value: sublatticeConceptIndexes !== null && !displayHighlightedSublatticeOnly ?
            sublatticeLinksCount :
            filteredConceptIndexes !== null && filteredLinks },
    ];

    return (
        <dl
            className="flex flex-col gap-1 overflow-auto thin-scrollbar px-5 pb-4 mt-1">
            {stats.map((stat, index) =>
                <div
                    key={index}
                    className={cn(
                        "flex justify-between items-center gap-3 pb-1",
                        index !== stats.length - 1 && "border-b border-outline-variant")}>
                    <dt>{stat.title}</dt>
                    <dd
                        className={cn(typeof stat.value !== "number" && "text-on-surface-container-muted text-sm")}>
                        {typeof stat.value === "number" ? stat.value : "N/A"}
                    </dd>
                </div>)}
        </dl>
    );
}