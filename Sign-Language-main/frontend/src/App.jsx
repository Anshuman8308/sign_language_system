import React, { useRef, useEffect, useState, useCallback } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api'

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentPrediction, setCurrentPrediction] = useState(null)
  const [sentence, setSentence] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  
  // Sentence formation state
  const [currentSign, setCurrentSign] = useState(null)
  const [signStartTime, setSignStartTime] = useState(null)
  const [pauseStartTime, setPauseStartTime] = useState(null)
  const signHoldDuration = 1000 // 1 second in milliseconds
  const pauseDuration = 2000 // 2 seconds in milliseconds

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' // Front-facing camera
        }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraError(null)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setCameraError('Unable to access camera. Please check permissions.')
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }, [])

  // Capture frame and send to API
  const captureAndPredict = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8)

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const data = await response.json()
      
      if (data.detected) {
        setCurrentPrediction(data.prediction)
        setConfidence(data.confidence)
        setError(null)

        // Handle sentence formation
        const now = Date.now()
        
        if (data.prediction !== currentSign) {
          // New sign detected
          setCurrentSign(data.prediction)
          setSignStartTime(now)
          setPauseStartTime(null)
        } else if (signStartTime && (now - signStartTime >= signHoldDuration)) {
          // Sign held long enough, add to sentence
          if (sentence === '' || sentence[sentence.length - 1] !== data.prediction) {
            setSentence(prev => prev + data.prediction)
          }
        }
      } else {
        // No hand detected
        setCurrentPrediction(null)
        setConfidence(0)
        
        // Handle pause for space
        const now = Date.now()
        if (pauseStartTime === null) {
          setPauseStartTime(now)
        } else if (now - pauseStartTime >= pauseDuration && sentence && sentence[sentence.length - 1] !== ' ') {
          setSentence(prev => prev + ' ')
        }
      }
    } catch (err) {
      console.error('Prediction error:', err)
      setError('Failed to get prediction. Make sure the backend server is running.')
    }
  }, [currentSign, signStartTime, pauseStartTime, sentence])

  // Start/stop detection
  useEffect(() => {
    if (isDetecting) {
      const interval = setInterval(captureAndPredict, 100) // Capture every 100ms
      return () => clearInterval(interval)
    }
  }, [isDetecting, captureAndPredict])

  // Initialize camera on mount
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [startCamera, stopCamera])

  const handleStart = () => {
    setIsDetecting(true)
    setSentence('')
    setCurrentSign(null)
    setSignStartTime(null)
    setPauseStartTime(null)
  }

  const handleStop = () => {
    setIsDetecting(false)
  }

  const handleClear = () => {
    setSentence('')
    setCurrentSign(null)
    setSignStartTime(null)
    setPauseStartTime(null)
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🤟 Sign Language Detection</h1>
          <p>Real-time American Sign Language (ASL) recognition</p>
        </header>

        <div className="main-content">
          <div className="video-section">
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {currentPrediction && (
                <div className="prediction-overlay">
                  <div className="prediction-badge">
                    <span className="prediction-text">{currentPrediction}</span>
                    <span className="confidence-text">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {!currentPrediction && isDetecting && (
                <div className="no-hand-overlay">
                  <p>Show your hand to the camera</p>
                </div>
              )}
            </div>

            <div className="controls">
              {!isDetecting ? (
                <button className="btn btn-start" onClick={handleStart}>
                  ▶️ Start Detection
                </button>
              ) : (
                <button className="btn btn-stop" onClick={handleStop}>
                  ⏹️ Stop Detection
                </button>
              )}
              <button className="btn btn-clear" onClick={handleClear} disabled={!sentence}>
                🗑️ Clear Sentence
              </button>
            </div>

            {cameraError && (
              <div className="error-message">
                ⚠️ {cameraError}
              </div>
            )}

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="info-section">
            <div className="info-card">
              <h2>Current Prediction</h2>
              {currentPrediction ? (
                <div className="prediction-display">
                  <div className="prediction-char">{currentPrediction}</div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                  <p className="confidence-value">
                    Confidence: {Math.round(confidence * 100)}%
                  </p>
                </div>
              ) : (
                <p className="no-prediction">No sign detected</p>
              )}
            </div>

            <div className="info-card">
              <h2>Your Sentence</h2>
              <div className="sentence-display">
                {sentence || <span className="placeholder">Your sentence will appear here...</span>}
              </div>
              {sentence && (
                <button className="btn btn-small" onClick={handleClear}>
                  Clear
                </button>
              )}
            </div>

            <div className="info-card">
              <h2>Instructions</h2>
              <ul className="instructions">
                <li>Click "Start Detection" to begin</li>
                <li>Show your hand to the camera</li>
                <li>Hold a sign for 1 second to add it to your sentence</li>
                <li>Pause for 2 seconds to add a space</li>
                <li>Make sure your hand is well-lit and visible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App


