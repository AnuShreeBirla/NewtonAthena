import { useRef, useState } from 'react'
import './App.css'

function App() {
  const videoRef = useRef(null)
  const [cameraStatus, setCameraStatus] = useState('idle')
  const [cameraError, setCameraError] = useState('')

  async function startCamera() {
    setCameraStatus('loading')
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' },
      })
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraStatus('active')
    } catch (error) {
      setCameraStatus('error')
      setCameraError(`Could not start camera: ${error.message}`)
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject
    stream?.getTracks().forEach((track) => track.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraStatus('idle')
    setCameraError('')
  }

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
        <div className="connection-status"><span className="status-dot" />Ready to begin</div>
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
          <div><p className="eyebrow">TEST STARTS IN</p><div className="timer">00:14:00</div></div>
          <button className="session-button" disabled>Enter Full Screen</button>
        </section>

        <footer className="app-footer">myAthena <span>·</span> Development build</footer>
      </main>
    </div>
  )
}

export default App
