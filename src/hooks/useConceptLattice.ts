import FileToLatticeWorker from "../workers/fileToLatticeWorker?worker";
import useConceptLatticeStore from "./stores/useConceptLatticeStore";
import { FileToLatticeRequest } from "../types/FileToLatticeRequest";
import { FileToLatticeResponse } from "../types/FileToLatticeResponse";

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

        currentWorker = new FileToLatticeWorker();
        const contextRequest: FileToLatticeRequest = { content: fileContent };
        currentWorker.postMessage(contextRequest);

        await new Promise<undefined>((resolve) => {
            currentWorker?.addEventListener("message", onResponse);
            
            function onResponse(e: MessageEvent<FileToLatticeResponse>) {
                switch (e.data.type) {
                    case "context":
                        setContext(e.data.context);
                        setProgressMessage("Computing concepts");
                        break;
                    case "concepts":
                        setConcepts(e.data.concepts);
                        setProgressMessage("Computing lattice");
                        break;
                    case "lattice":
                        setLattice(e.data.lattice);
                        currentWorker?.removeEventListener("message", onResponse);
                        resolve(undefined);
                        break;
                }
            }
        });
        
        currentWorker?.terminate();
        currentWorker = null;
        setProgressMessage(null);
    }

    return {
        setupLattice
    };
}