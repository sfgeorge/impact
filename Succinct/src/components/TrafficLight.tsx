import React from 'react';

interface TrafficLightProps {
    elapsedTimeMs: number;
    limitMs: number;
}

export const TrafficLight: React.FC<TrafficLightProps> = ({ elapsedTimeMs, limitMs }) => {
    const percentage = Math.min((elapsedTimeMs / limitMs) * 100, 100);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '20px',
            backgroundColor: '#333',
            borderRadius: '15px',
            width: '100px'
        }}>
            <Light active={percentage < 80} color="#4caf50" />
            <Light active={percentage >= 80 && percentage < 100} color="#ffeb3b" />
            <Light active={percentage >= 100} color="#f44336" />
        </div>
    );
};

const Light = ({ active, color }: { active: boolean; color: string }) => (
    <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: color,
        opacity: active ? 1 : 0.2,
        boxShadow: active ? `0 0 20px ${color}` : 'none',
        transition: 'all 0.3s ease'
    }} />
);
