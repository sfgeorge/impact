import { useEffect, useRef, useState } from 'react';

interface AudioMonitorProps {
    onSpeakingStateChange: (isSpeaking: boolean) => void;
    threshold?: number; // 0.0 to 1.0
}

export const AudioMonitor = ({ onSpeakingStateChange, threshold = 0.02 }: AudioMonitorProps): JSX.Element => {
    const [error, setError] = useState<string | null>(null);
    const [volume, setVolume] = useState<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const requestRef = useRef<number>();

    useEffect(() => {
        let stream: MediaStream;

        const initAudio = async (): Promise<void> => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                audioContextRef.current = new window.AudioContext();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256;

                sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                sourceRef.current.connect(analyserRef.current);

                const bufferLength = analyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const updateVolume = (): void => {
                    if (!analyserRef.current) return;

                    analyserRef.current.getByteFrequencyData(dataArray);

                    // Calculate average volume
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;
                    const normalizedVolume = average / 255;

                    setVolume(normalizedVolume);
                    onSpeakingStateChange(normalizedVolume > threshold);

                    requestRef.current = requestAnimationFrame(updateVolume);
                };

                updateVolume();
            } catch (err) {
                console.error('Error accessing microphone:', err);
                setError('Could not access microphone. Please check permissions.');
            }
        };

        initAudio();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [threshold, onSpeakingStateChange]);

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div>
            <h3>Audio Monitor</h3>
            <p>Microphone Status: {volume > 0 ? 'Active' : 'Waiting...'}</p>
            <div style={{
                width: '100%',
                height: '10px',
                backgroundColor: '#eee',
                borderRadius: '5px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${Math.min(volume * 500, 100)}%`,
                    height: '100%',
                    backgroundColor: volume > threshold ? 'green' : 'gray',
                    transition: 'width 0.1s ease'
                }} />
            </div>
        </div>
    );
};
