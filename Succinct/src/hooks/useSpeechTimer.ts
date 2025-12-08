import { useEffect, useRef, useState } from 'react';

interface UseSpeechTimerProps {
    isSpeaking: boolean;
    silenceThresholdMs?: number;
}

export const useSpeechTimer = ({ isSpeaking, silenceThresholdMs = 2000 }: UseSpeechTimerProps) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const silenceStartRef = useRef<number | null>(null);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isSpeaking) {
            // User is speaking: Clear any silence tracker, ensure session is active
            silenceStartRef.current = null;
            setIsSessionActive(true);

            intervalId = setInterval(() => {
                setElapsedTime(prev => prev + 100);
            }, 100);
        } else if (isSessionActive) {
            // User stopped speaking, but session detected. Check for silence timeout.
            if (!silenceStartRef.current) {
                silenceStartRef.current = Date.now();
            }

            intervalId = setInterval(() => {
                if (silenceStartRef.current && (Date.now() - silenceStartRef.current > silenceThresholdMs)) {
                    // Silence threshold reached: Auto-reset
                    console.log("Silence detected, resetting timer");
                    setElapsedTime(0);
                    setIsSessionActive(false);
                    silenceStartRef.current = null;
                }
            }, 100);
        }

        return () => clearInterval(intervalId);
    }, [isSpeaking, isSessionActive, silenceThresholdMs]);

    const resetTimer = () => {
        setElapsedTime(0);
        setIsSessionActive(false);
    };

    return {
        elapsedTime, // in milliseconds
        resetTimer
    };
};
