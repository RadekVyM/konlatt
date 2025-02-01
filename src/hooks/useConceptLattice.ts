import { ContextParsingRequest } from "../types/ContextParsingRequest";
import { ContextParsingResponse } from "../types/ContextParsingResponse";
import { RawFormalContext } from "../types/RawFormalContext";
import ContextParsingWorker from "../workers/contextParsingWorker?worker";
import ConceptComputationWorker from "../workers/conceptComputationWorker?worker";
import LatticeComputationWorker from "../workers/latticeComputationWorker?worker";
import useConceptLatticeStore from "./stores/useConceptLatticeStore";
import { ConceptComputationRequest } from "../types/ConceptComputationRequest";
import { RawFormalConcept } from "../types/RawFormalConcept";
import { ConceptComputationResponse } from "../types/ConceptComputationResponse";
import { LatticeComputationRequest } from "../types/LatticeComputationRequest";
import { ConceptLattice } from "../types/ConceptLattice";
import { LatticeComputationResponse } from "../types/LatticeComputationResponse";

let currentWorker: Worker | null = null;

export default function useConceptLattice() {
    const setProgressMessage = useConceptLatticeStore((state) => state.setProgressMessage);
    const setFile = useConceptLatticeStore((state) => state.setFile);
    const setContext = useConceptLatticeStore((state) => state.setContext);
    const setConcepts = useConceptLatticeStore((state) => state.setConcepts);
    const setLattice = useConceptLatticeStore((state) => state.setLattice);

    async function setupLattice(file: File) {
        setFile(file);
        setContext(null);
        setConcepts(null);
        setLattice(null);

        setProgressMessage("Parsing file");

        const fileContent = await file.text();

        currentWorker?.terminate();

        currentWorker = new ContextParsingWorker();
        const contextRequest: ContextParsingRequest = { content: fileContent };
        currentWorker.postMessage(contextRequest);

        const context = await new Promise<RawFormalContext>((resolve) => {
            currentWorker?.addEventListener("message", onContextResponse);
            
            function onContextResponse(e: MessageEvent<ContextParsingResponse>) {
                resolve(e.data.context);
                currentWorker?.removeEventListener("message", onContextResponse);
            }
        });
        setContext(context);
        
        currentWorker?.terminate();
        setProgressMessage("Computing concepts");

        currentWorker = new ConceptComputationWorker();
        const conceptRequest: ConceptComputationRequest = { context };
        currentWorker.postMessage(conceptRequest);

        const concepts = await new Promise<Array<RawFormalConcept>>((resolve) => {
            currentWorker?.addEventListener("message", onContextResponse);
            
            function onContextResponse(e: MessageEvent<ConceptComputationResponse>) {
                resolve(e.data.concepts);
                currentWorker?.removeEventListener("message", onContextResponse);
            }
        });
        setConcepts(concepts);

        currentWorker?.terminate();
        setProgressMessage("Computing lattice");

        currentWorker = new LatticeComputationWorker();
        const latticeRequest: LatticeComputationRequest = { concepts };
        currentWorker.postMessage(latticeRequest);

        const lattice = await new Promise<ConceptLattice>((resolve) => {
            currentWorker?.addEventListener("message", onContextResponse);
            
            function onContextResponse(e: MessageEvent<LatticeComputationResponse>) {
                resolve(e.data.lattice);
                currentWorker?.removeEventListener("message", onContextResponse);
            }
        });
        setLattice(lattice);

        currentWorker?.terminate();
        currentWorker = null;
        setProgressMessage(null);
    }

    return {
        setupLattice
    };
}