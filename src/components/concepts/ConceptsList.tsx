import { useRef, useState } from "react";
import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import { cn } from "../../utils/tailwind";
import Container from "../Container";
import SearchInput from "../SearchInput";
import useLazyListCount from "../../hooks/useLazyListCount";
import Button from "../inputs/Button";
import CardItemsLazyList from "../CardItemsLazyList";

export default function Concepts(props: {
    className?: string,
}) {
    const [searchInput, setSearchInput] = useState<string>("");
    const concepts = useConceptLatticeStore((state) => state.concepts);

    return (
        <Container
            as="section"
            className={cn("pt-3 flex flex-col overflow-hidden", props.className)}>
            <header
                className="pb-3 flex flex-col">
                <span
                    className="flex justify-between items-center">
                    <h2
                        className="mx-4 mb-2 text-lg font-semibold">
                        Concepts
                    </h2>
                    <span className="text-xs text-on-surface-container-muted mr-4 mb-2">{concepts?.length}</span>
                </span>
                <SearchInput
                    className="self-stretch mx-3"
                    value={searchInput}
                    onChange={setSearchInput}
                    placeholder="Search concepts..." />
            </header>

            <ConceptsList
                className="flex-1"
                searchInput={searchInput} />
        </Container>
    );
}

function ConceptsList(props: {
    className?: string,
    searchInput: string,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const concepts = useConceptLatticeStore((state) => state.concepts);
    const context = useConceptLatticeStore((state) => state.context);
    const filteredConcepts = concepts || [];
    const [displayedItemsCount] = useLazyListCount(filteredConcepts.length, 20, observerTargetRef);
    const displayedItems = filteredConcepts.slice(0, displayedItemsCount);

    if (!context || !concepts || filteredConcepts.length === 0) {
        return (
            <div
                className={cn("grid place-content-center text-sm text-on-surface-container-muted", props.className)}>
                Nothing found
            </div>
        )
    }

    return (
        <CardItemsLazyList
            className={props.className}
            observerTargetRef={observerTargetRef}>
            {displayedItems.map((item, index) =>
                <li
                    key={index}
                    className={cn(
                        "px-1 py-0.5",
                        index < filteredConcepts.length - 1 && "border-b border-outline-variant")}>
                    <Button
                        className="w-full text-start py-1.5"
                        onClick={() => {}}>
                        <div>
                            <div className="mb-0.5 text-sm line-clamp-3">
                                {item.objects.length > 0 ?
                                    item.objects.map((o) => context?.objects[o]).join(", ").substring(0, 800) :
                                    <span className="italic">No objects</span>}
                            </div>
                            <div className="text-on-surface-container-muted text-xs line-clamp-3">
                                {item.attributes.length > 0 ?
                                    item.attributes.map((a) => context?.attributes[a]).join(", ").substring(0, 800) :
                                    <span className="italic">No attributes</span>}
                            </div>
                        </div>
                    </Button>
                </li>)}
        </CardItemsLazyList>
    );
}