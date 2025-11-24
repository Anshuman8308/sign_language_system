# Sign Language Detection Web Application

A real-time American Sign Language (ASL) detection system with a modern web frontend and Flask backend API.

## Features

- 🤟 Real-time sign language detection using webcam
- 🎯 Detects letters A-Z and "hello"
- 📝 Sentence formation by holding signs
- 🎨 Modern, responsive web interface
- 🔄 Real-time prediction updates
- 📊 Confidence scores for predictions

## Project Structure

```
SIGN-LANGUAGE-DETECTION/
├── app.py                 # Flask backend API server
├── requirements.txt       # Python dependencies
├── model.p               # Trained model (must exist)
├── inference_classifier.py  # Original CLI inference script
├── train_classifier.py   # Model training script
├── frontend/
│   ├── package.json      # Node.js dependencies
│   ├── vite.config.js    # Vite configuration
│   ├── index.html        # HTML entry point
│   └── src/
│       ├── main.jsx      # React entry point
│       ├── App.jsx       # Main React component
│       ├── App.css       # Styles
│       └── index.css     # Global styles
└── README.md             # This file
```

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- Trained model file (`model.p`) - must be in the SIGN-LANGUAGE-DETECTION directory
- Webcam access

## Installation

### 1. Backend Setup

1. Navigate to the project directory:
```bash
cd SIGN-LANGUAGE-DETECTION
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### 2. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## Running the Application

### Option 1: Run Both Servers Manually

1. **Start the Flask backend** (in `SIGN-LANGUAGE-DETECTION` directory):
```bash
python app.py
```
The API will be available at `http://localhost:5000`

2. **Start the frontend development server** (in `frontend` directory):
```bash
npm run dev
```
The frontend will be available at `http://localhost:3000`

### Option 2: Use the Launch Scripts

#### Windows:
```bash
# In SIGN-LANGUAGE-DETECTION directory
start_backend.bat
# In another terminal
cd frontend
npm run dev
```

#### Linux/Mac:
```bash
# In SIGN-LANGUAGE-DETECTION directory
./start_backend.sh
# In another terminal
cd frontend
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Allow camera access when prompted
3. Click "Start Detection" to begin
4. Show your hand to the camera
5. Hold a sign for 1 second to add it to your sentence
6. Pause for 2 seconds to add a space between words
7. Click "Clear Sentence" to reset

## API Endpoints

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Sign Language Detection API is running"
}
```

### `POST /api/predict`
Predict sign language from an image frame.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "detected": true,
  "prediction": "A",
  "confidence": 0.95,
  "bbox": {
    "x1": 100,
    "y1": 100,
    "x2": 200,
    "y2": 200
  }
}
```

### `GET /api/labels`
Get all available labels.

**Response:**
```json
{
  "labels": ["A", "B", "C", ...],
  "label_map": {0: "A", 1: "B", ...}
}
```

## Troubleshooting

### Camera Not Working
- Make sure you've granted camera permissions in your browser
- Check if another application is using the camera
- Try refreshing the page

### Backend Not Responding
- Ensure the Flask server is running on port 5000
- Check if `model.p` exists in the SIGN-LANGUAGE-DETECTION directory
- Verify all Python dependencies are installed

### CORS Errors
- Make sure the Flask backend is running
- Check that the frontend is configured to proxy to `http://localhost:5000`

### Model Not Found
- Run `train_classifier.py` first to generate `model.p`
- Ensure `model.p` is in the same directory as `app.py`

## Development

### Building for Production

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. The built files will be in `frontend/dist/`

### Backend Development

The Flask server runs in debug mode by default. To disable:
```python
app.run(host='0.0.0.0', port=5000, debug=False)
```

## Technologies Used

- **Backend:** Flask, MediaPipe, OpenCV, scikit-learn
- **Frontend:** React, Vite
- **ML Model:** Random Forest Classifier

## License

This project is open source and available for educational purposes.


