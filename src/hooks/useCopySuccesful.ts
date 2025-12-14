import { useRef, useState } from "react";

const COPY_SUCCESSFUL_TIMEOUT_LENGTH = 1500;

export default function useCopySuccessful(): [boolean, (value: boolean) => void] {
    const copySuccessfulTimeoutRef = useRef<number>(null);
    const [copySuccessful, setCopySuccessful] = useState<boolean>(false);

    function set(value: boolean) {
        if (!value) {
            setCopySuccessful(false);
            if (copySuccessfulTimeoutRef.current !== null) {
                clearTimeout(copySuccessfulTimeoutRef.current);
            }
        }
        else {
            setCopySuccessful(true);
            copySuccessfulTimeoutRef.current = setTimeout(() => {
                setCopySuccessful(false);
            }, COPY_SUCCESSFUL_TIMEOUT_LENGTH);
        }
    }

    return [copySuccessful, set];
}