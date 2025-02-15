import { useRef, useState } from "react";
import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";
import { cn } from "../../utils/tailwind";
import SearchInput from "../SearchInput";
import useLazyListCount from "../../hooks/useLazyListCount";
import Button from "../inputs/Button";
import CardItemsLazyList from "../CardItemsLazyList";
import { CardContainer } from "../CardContainer";
import ConceptDetail from "./ConceptDetail";
import NothingFound from "../NothingFound";
import CardSection from "../CardSection";

export default function Concepts(props: {
    className?: string,
}) {
    const [selectedConceptIndex, setSelectedConceptIndex] = useState<number | null>(null);

    return (
        <CardContainer
            className={props.className}>
            <ConceptsList
                className={cn(selectedConceptIndex !== null && "hidden")}
                setSelectedConceptIndex={setSelectedConceptIndex} />
            {selectedConceptIndex !== null &&
                <ConceptDetail
                    selectedConceptIndex={selectedConceptIndex}
                    setSelectedConceptIndex={setSelectedConceptIndex} />}
        </CardContainer>
    );
}

function ConceptsList(props: {
    className?: string,
    setSelectedConceptIndex: (index: number | null) => void,
}) {
    const [searchInput, setSearchInput] = useState<string>("");
    const concepts = useConceptLatticeStore((state) => state.concepts);

    return (
        <CardSection
            className={props.className}>
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

            <List
                className="flex-1"
                searchInput={searchInput}
                setSelectedConceptIndex={props.setSelectedConceptIndex} />
        </CardSection>
    );
}

function List(props: {
    className?: string,
    searchInput: string,
    setSelectedConceptIndex: (index: number | null) => void,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const concepts = useConceptLatticeStore((state) => state.concepts);
    const context = useConceptLatticeStore((state) => state.context);
    const filteredConcepts = concepts || [];
    const [displayedItemsCount] = useLazyListCount(filteredConcepts.length, 20, observerTargetRef);
    const displayedItems = filteredConcepts.slice(0, displayedItemsCount);

    if (!context || !concepts || filteredConcepts.length === 0) {
        return (
            <NothingFound
                className={props.className} />
        );
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
                        onClick={() => props.setSelectedConceptIndex(index)}>
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