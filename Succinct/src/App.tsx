import { useState } from 'react'
import './App.css'
import { AudioMonitor } from './components/AudioMonitor'
import { useSpeechTimer } from './hooks/useSpeechTimer'
import { TrafficLight } from './components/TrafficLight'

function App() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [timeLimit, setTimeLimit] = useState(60 * 1000) // Default 1 minute
  const { elapsedTime } = useSpeechTimer({ isSpeaking, silenceThresholdMs: 3000 })

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <>
      <div>
        <h1>Succinct</h1>
      </div>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', flex: 1 }}>
          <h2>Session Info</h2>
          <div style={{ fontSize: '3em', fontFamily: 'monospace', margin: '20px 0', fontWeight: 'bold' }}>
            {formatTime(elapsedTime)}
          </div>
          <p>User is speaking: <strong>{isSpeaking ? 'YES' : 'NO'}</strong></p>

          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <label>
              Target Time (seconds):
              <input
                type="number"
                value={timeLimit / 1000}
                onChange={(e) => setTimeLimit(Number(e.target.value) * 1000)}
                style={{ marginLeft: '10px', fontSize: '1.2em', width: '80px' }}
              />
            </label>
          </div>

          <h3>Signal</h3>
          <AudioMonitor
            onSpeakingStateChange={(speaking) => setIsSpeaking(speaking)}
            threshold={0.05}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <TrafficLight elapsedTimeMs={elapsedTime} limitMs={timeLimit} />
        </div>
      </div>
    </>
  )
}

export default App
