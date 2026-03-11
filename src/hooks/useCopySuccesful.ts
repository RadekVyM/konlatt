import { useRef, useState } from "react";

const COPY_SUCCESSFUL_TIMEOUT_LENGTH = 1500;

/**
 * A hook to manage a temporary "success" state, used for clipboard copy feedback.
 * When the state is set to `true`, it automatically reverts to `false` after 1500ms.
 * If manually set to `false` before the timer finishes, the existing timeout is cleared.
 */
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