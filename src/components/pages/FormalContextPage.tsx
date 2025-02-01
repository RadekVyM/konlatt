import useConceptLatticeStore from "../../hooks/stores/useConceptLatticeStore";

export default function ExportPage() {
    const context = useConceptLatticeStore((state) => state.context);

    return (
        <div>
            <p>Objects: {context?.objects.length}</p>
            <p>Attributes: {context?.attributes.length}</p>
        </div>
    );
}