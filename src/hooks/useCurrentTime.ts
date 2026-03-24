import { useEffect, useRef, useState } from "react";
import Loop from "../utils/Loop";

/**
 * A hook that manages a time-based loop to provide the current timestamp.
 */
export default function useCurrentTime(loop: boolean) {
    const loopRef = useRef<Loop | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);

    useEffect(() => {
        if (loopRef.current) {
            loopRef.current.stop();
            loopRef.current.dispose();
            loopRef.current = null;
        }

        if (loop) {
            loopRef.current = new Loop(() => {
                const newTime = new Date().getTime();
                setCurrentTime(newTime);
            }, 500);
            loopRef.current.start();
        }

        return () => {
            if (loopRef.current) {
                loopRef.current.stop();
                loopRef.current.dispose();
                loopRef.current = null;
            }
        };
    }, [loop]);

    return currentTime;
}