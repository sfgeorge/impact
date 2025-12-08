import { useEffect, useState, useRef } from 'react'
import './App.css'
import { AudioMonitor } from './components/AudioMonitor'
import { useSpeechTimer } from './hooks/useSpeechTimer'
import { TrafficLight } from './components/TrafficLight'

function App() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [timeLimit, setTimeLimit] = useState(60 * 1000) // Default 1 minute
  const [sensitivity, setSensitivity] = useState(0.1) // Default 0.1
  const [holdDownTime, setHoldDownTime] = useState(1000) // Default 1 second

  const { elapsedTime } = useSpeechTimer({ isSpeaking, silenceThresholdMs: holdDownTime })
  const isLoadedRef = useRef(false)

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await window.ipcRenderer.getSettings()
      if (settings) {
        if (settings.timeLimit) setTimeLimit(settings.timeLimit)
        if (settings.sensitivity) setSensitivity(settings.sensitivity)
        if (settings.holdDownTime) setHoldDownTime(settings.holdDownTime)
      }
      isLoadedRef.current = true
    }
    loadSettings()
  }, [])

  // Save settings on change
  useEffect(() => {
    if (isLoadedRef.current) {
      window.ipcRenderer.saveSettings({
        timeLimit,
        sensitivity,
        holdDownTime
      })
    }
  }, [timeLimit, sensitivity, holdDownTime])

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

          <div style={{ marginTop: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>
              Target Time (seconds):
              <input
                type="number"
                value={timeLimit / 1000}
                onChange={(e) => setTimeLimit(Number(e.target.value) * 1000)}
                style={{ marginLeft: '10px', fontSize: '1.2em', width: '80px' }}
              />
            </label>

            <label>
              Hold Silence (ms):
              <input
                type="number"
                value={holdDownTime}
                onChange={(e) => setHoldDownTime(Number(e.target.value))}
                step="100"
                min="0"
                style={{ marginLeft: '10px', fontSize: '1.2em', width: '80px' }}
              />
              <small style={{ marginLeft: '10px', color: '#666' }}>(Wait time before reset)</small>
            </label>

            <label>
              Sensitivity (0.01 - 0.5):
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                style={{ marginLeft: '10px', verticalAlign: 'middle' }}
              />
              <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{sensitivity}</span>
            </label>
            <small style={{ color: '#666' }}>Higher = Less Sensitive (Filters more noise)</small>
          </div>

          <h3>Signal</h3>
          <AudioMonitor
            onSpeakingStateChange={(speaking) => setIsSpeaking(speaking)}
            threshold={sensitivity}
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
