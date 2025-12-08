import { useEffect, useRef, useState } from 'react';

interface UseSpeechTimerProps {
    isSpeaking: boolean;
    silenceThresholdMs?: number;
}

export const useSpeechTimer = ({ isSpeaking, silenceThresholdMs = 2000 }: UseSpeechTimerProps) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isSessionActive, setIsSessionActive] = useState(false);

    const sessionStartTimeRef = useRef<number | null>(null);
    const silenceStartTimeRef = useRef<number | null>(null);

    // Effect to handle state transitions (Speaking <-> Silent)
    useEffect(() => {
        if (isSpeaking) {
            // Speech detected
            if (!isSessionActive) {
                // Start new session
                setIsSessionActive(true);
                sessionStartTimeRef.current = Date.now();
                setElapsedTime(0);
            }
            // Clear silence timer since we are speaking
            silenceStartTimeRef.current = null;
        } else {
            // Silence detected
            if (isSessionActive && !silenceStartTimeRef.current) {
                // Mark start of silence
                silenceStartTimeRef.current = Date.now();
            }
        }
    }, [isSpeaking, isSessionActive]);

    // Effect to drive the timer tick
    useEffect(() => {
        let animationFrameId: number;

        const tick = () => {
            if (isSessionActive && sessionStartTimeRef.current) {
                const now = Date.now();

                // Update elapsed time (Always based on start time, so it never pauses/drifts)
                setElapsedTime(now - sessionStartTimeRef.current);

                // Check silence threshold
                if (!isSpeaking && silenceStartTimeRef.current) {
                    if (now - silenceStartTimeRef.current > silenceThresholdMs) {
                        // Reset session
                        setIsSessionActive(false);
                        sessionStartTimeRef.current = null;
                        silenceStartTimeRef.current = null;
                        setElapsedTime(0);
                        return; // Stop loop
                    }
                }

                animationFrameId = requestAnimationFrame(tick);
            }
        };

        if (isSessionActive) {
            animationFrameId = requestAnimationFrame(tick);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isSessionActive, isSpeaking, silenceThresholdMs]);

    return {
        elapsedTime,
        resetTimer: () => {
            setIsSessionActive(false);
            sessionStartTimeRef.current = null;
            silenceStartTimeRef.current = null;
            setElapsedTime(0);
        }
    };
};
