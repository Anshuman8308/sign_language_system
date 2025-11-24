# Quick Start Guide

## 🚀 Quick Launch Steps

### Step 1: Install Backend Dependencies
```bash
cd SIGN-LANGUAGE-DETECTION
pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 3: Start Backend Server
Open a terminal in `SIGN-LANGUAGE-DETECTION` directory:
```bash
python app.py
```
You should see: `🚀 Starting Flask server...` and `API will be available at http://localhost:5000`

### Step 4: Start Frontend Server
Open another terminal in `frontend` directory:
```bash
npm run dev
```
You should see: `Local: http://localhost:3000`

### Step 5: Open in Browser
Navigate to: **http://localhost:3000**

### Step 6: Allow Camera Access
When prompted, click "Allow" to grant camera permissions.

### Step 7: Start Detection
Click the "▶️ Start Detection" button and show your hand to the camera!

## ⚠️ Important Notes

- Make sure `model.p` exists in the `SIGN-LANGUAGE-DETECTION` directory
- Keep both servers running (backend on port 5000, frontend on port 3000)
- Ensure your webcam is not being used by another application
- For best results, ensure good lighting and clear hand visibility

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 5000 is already in use
- Verify `model.p` exists
- Make sure all Python packages are installed

**Frontend won't start:**
- Check if port 3000 is already in use
- Make sure Node.js is installed (`node --version`)
- Run `npm install` again if needed

**Camera not working:**
- Check browser permissions
- Try a different browser (Chrome/Firefox recommended)
- Restart the browser

**No predictions:**
- Make sure backend is running
- Check browser console for errors
- Verify your hand is clearly visible in the camera


