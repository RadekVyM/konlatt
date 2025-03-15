import { useRef, useState } from "react";
import useProjectStore from "../../hooks/stores/useProjectStore";
import { cn } from "../../utils/tailwind";
import SearchInput from "../SearchInput";
import useLazyListCount from "../../hooks/useLazyListCount";
import Button from "../inputs/Button";
import CardItemsLazyList from "../CardItemsLazyList";
import { CardContainer } from "../CardContainer";
import ConceptDetail from "./ConceptDetail";
import NothingFound from "../NothingFound";
import CardSection from "../CardSection";
import FilterOrderBar from "../FilterOrderBar";
import Found from "../Found";
import { FormalConcept } from "../../types/FormalConcepts";
import { RawFormalContext } from "../../types/RawFormalContext";
import HighlightedSearchTerms from "../HighlightedSearchTerms";
import { searchTermsToRegex } from "../../utils/search";
import ExportButton from "../ExportButton";

export default function Concepts(props: {
    className?: string,
    selectedConceptIndex: number | null,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
}) {
    return (
        <CardContainer
            className={props.className}>
            <ConceptsList
                className={cn(props.selectedConceptIndex !== null && "hidden")}
                setSelectedConceptIndex={props.setSelectedConceptIndex} />
            {props.selectedConceptIndex !== null &&
                <ConceptDetail
                    selectedConceptIndex={props.selectedConceptIndex}
                    setSelectedConceptIndex={props.setSelectedConceptIndex} />}
        </CardContainer>
    );
}

function ConceptsList(props: {
    className?: string,
    setSelectedConceptIndex: (index: number | null) => void,
}) {
    const [searchInput, setSearchInput] = useState<string>("");
    const concepts = useProjectStore((state) => state.concepts);
    const context = useProjectStore((state) => state.context);
    const searchTerms = searchInput.trim().split(" ").filter((t) => t.length > 0);
    const filteredConcepts = concepts && context ?
        concepts.filter((concept) => conceptsFilter(concept, searchTerms, context)) :
        [];

    return (
        <CardSection
            className={props.className}>
            <header
                className="pb-1.5 flex flex-col">
                <div
                    className="flex justify-between items-center mb-2.5">
                    <h2
                        className="mx-4 text-lg font-semibold">
                        Concepts
                    </h2>

                    <ExportButton
                        className="mr-4" />
                </div>
                <div
                    className="self-stretch flex mx-4 mb-2 gap-2">
                    <SearchInput
                        className="flex-1"
                        value={searchInput}
                        onChange={setSearchInput}
                        placeholder="Search concepts..." />
                    <FilterOrderBar />
                </div>

                <Found
                    className="mx-4"
                    found={filteredConcepts.length}
                    total={concepts?.length || 0} />
            </header>

            <List
                className="flex-1"
                filteredConcepts={filteredConcepts}
                searchTerms={searchTerms}
                setSelectedConceptIndex={props.setSelectedConceptIndex} />
        </CardSection>
    );
}

function List(props: {
    className?: string,
    filteredConcepts: Array<FormalConcept>,
    searchTerms: Array<string>,
    setSelectedConceptIndex: (index: number | null) => void,
}) {
    const observerTargetRef = useRef<HTMLDivElement>(null);
    const concepts = useProjectStore((state) => state.concepts);
    const context = useProjectStore((state) => state.context);
    const [displayedItemsCount] = useLazyListCount(props.filteredConcepts.length, 20, observerTargetRef);
    const displayedItems = props.filteredConcepts.slice(0, displayedItemsCount);
    const searchRegex = searchTermsToRegex(props.searchTerms);

    if (!context || !concepts || props.filteredConcepts.length === 0) {
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
                        "px-1 py-0.5 concept-list-item",
                        index < props.filteredConcepts.length - 1 && "border-b border-outline-variant")}>
                    <Button
                        className="w-full text-start py-1.5"
                        onClick={() => props.setSelectedConceptIndex(index)}>
                        <div>
                            <div className="mb-0.5 text-sm line-clamp-3">
                                {item.objects.length > 0 ?
                                    <HighlightedSearchTerms
                                        text={item.objects.map((o) => context?.objects[o]).join(", ").substring(0, 800)}
                                        regex={searchRegex} /> :
                                    <span className="italic">No objects</span>}
                            </div>
                            <div className="text-on-surface-container-muted text-xs line-clamp-3">
                                {item.attributes.length > 0 ?
                                    <HighlightedSearchTerms
                                        text={item.attributes.map((a) => context?.attributes[a]).join(", ").substring(0, 800)}
                                        regex={searchRegex} /> :
                                    <span className="italic">No attributes</span>}
                            </div>
                        </div>
                    </Button>
                </li>)}
        </CardItemsLazyList>
    );
}

function conceptsFilter(concept: FormalConcept, searchTerms: Array<string>, context: RawFormalContext): boolean {
    return searchTerms
        .map((term) => term.toLowerCase())
        .every((term) => concept.objects.some((o) => context.objects[o].toLowerCase().includes(term)) ||
            concept.attributes.some((a) => context.attributes[a].toLowerCase().includes(term)));
}