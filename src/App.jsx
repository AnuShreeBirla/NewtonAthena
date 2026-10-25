import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraStatus, setCameraStatus] = useState('idle')
  const [cameraError, setCameraError] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(14 * 60)
  const [sessionActive, setSessionActive] = useState(false)
  const [fullScreenApproved, setFullScreenApproved] = useState(false)

  useEffect(() => {
    if (elapsedSeconds <= 0) return undefined
    const timer = setInterval(() => {
      setElapsedSeconds((seconds) => Math.max(seconds - 1, 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [elapsedSeconds])

  async function startCamera() {
    setCameraStatus('loading')
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' },
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraStatus('active')
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setCameraStatus('error')
      setCameraError(`Could not start camera: ${error.message}`)
    }
  }

  function startSession() {
    if (cameraStatus !== 'active' || elapsedSeconds > 0 || !fullScreenApproved) return
    setSessionActive(true)
  }

  function endSession() {
    setSessionActive(false)
  }

  async function enterFullScreen() {
    const approved = await window.electronAPI.requestFullScreen()
    if (approved) setFullScreenApproved(true)
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraStatus('idle')
    setCameraError('')
  }

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(elapsedSeconds % 60).padStart(2, '0')

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">A</div>
          <div>
            <h1>myAthena</h1>
            <p>Camera Test Workspace</p>
          </div>
        </div>
        <div className="connection-status"><span className={`status-dot ${sessionActive ? 'active' : ''}`} />{sessionActive ? 'Session active' : 'Ready to begin'}</div>
      </header>

      <main className="workspace">
        <section className="welcome-section">
          <p className="eyebrow">WORKSPACE</p>
          <h2>Your testing space</h2>
          <p className="subtitle">Start your camera and prepare your workspace.</p>
        </section>

        <section className="camera-card">
          <div className="card-heading">
            <div><h3>Camera preview</h3><p>Connect your camera to view the live feed.</p></div>
            <span className="preview-badge">{cameraStatus === 'active' ? 'LIVE' : 'CAMERA'}</span>
          </div>
          <div className="camera-preview">
            <video ref={videoRef} className={`camera-video ${cameraStatus === 'active' ? 'visible' : ''}`} autoPlay muted playsInline />
            {cameraStatus !== 'active' && <div className="camera-placeholder"><div className="camera-icon">◎</div><h3>{cameraStatus === 'loading' ? 'Connecting to camera…' : cameraStatus === 'error' ? 'Camera unavailable' : 'Camera not connected'}</h3><p>{cameraError || 'Select Start camera to request access to your camera.'}</p></div>}
          </div>
          <div className="camera-footer">
            <span>{cameraStatus === 'active' ? 'Camera connected' : 'Camera preview status'}</span>
            <button className="secondary-button" onClick={cameraStatus === 'active' ? stopCamera : startCamera} disabled={cameraStatus === 'loading'}>{cameraStatus === 'active' ? 'Stop camera' : 'Start camera'}</button>
          </div>
        </section>

        <section className="session-card">
          <div><p className="eyebrow">{elapsedSeconds === 0 ? 'TEST IS READY' : 'TEST STARTS IN'}</p><div className="timer">{hours}:{minutes}:{seconds}</div></div>
          <button className={`session-button ${sessionActive ? 'stop-button' : ''}`} onClick={sessionActive ? endSession : fullScreenApproved ? startSession : enterFullScreen} disabled={!sessionActive && fullScreenApproved && (elapsedSeconds > 0 || cameraStatus !== 'active')}>{sessionActive ? 'End Test' : fullScreenApproved ? 'Start Test' : 'Enter Full Screen'}</button>
        </section>

        <footer className="app-footer">myAthena <span>·</span> Development build</footer>
      </main>
    </div>
  )
}

export default App
