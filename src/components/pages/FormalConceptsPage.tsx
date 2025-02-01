import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";

export default function ExportPage() {
    const concepts = useConceptLatticeStore((state) => state.concepts);
    const lattice = useConceptLatticeStore((state) => state.lattice);
    
    return (
        <div>
            <p>Concepts: {concepts?.length}</p>
            <p>Links count in the lattice: {lattice?.mapping.reduce((prev, curr) => prev + curr.size, 0)}</p>
        </div>
    );
}