/* eslint-disable react-compiler/react-compiler */

import FileToLatticeWorker from "../workers/fileToLatticeWorker?worker";
import useConceptLatticeStore from "./stores/useConceptLatticeStore";
import { FileToLatticeRequest } from "../types/WorkerRequest";
import { WorkerResponse } from "../types/WorkerResponse";

// Single worker is reused for all formal context calculations
// This way the data can be kept in the worker to save some time due to fewer serialization
// When a new file is loaded, new worker is created and the old one destroyed
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

        const fileContent = await file.text();

        currentWorker?.terminate();
        currentWorker = new FileToLatticeWorker();

        const contextRequest: FileToLatticeRequest = { type: "file-to-lattice", content: fileContent };
        currentWorker.postMessage(contextRequest);
        currentWorker.addEventListener("message", onResponse);

        function onResponse(e: MessageEvent<WorkerResponse>) {
            switch (e.data.type) {
                case "status":
                    setProgressMessage(e.data.message);
                    break;
                case "context":
                    setContext(e.data.context);
                    break;
                case "concepts":
                    setConcepts(e.data.concepts);
                    break;
                case "lattice":
                    setLattice(e.data.lattice);
                    break;
                case "finished":
                    currentWorker?.removeEventListener("message", onResponse);
                    break;
            }
        }
    }

    return {
        setupLattice
    };
}