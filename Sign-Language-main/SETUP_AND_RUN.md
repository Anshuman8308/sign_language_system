# Complete Setup Guide - Sign Language Detection

## 🎯 Simple Solution: Use System Python (Recommended)

Your system Python (C:\Python311) already has most packages installed. Let's use that.

### Step 1: Close Everything
- Close ALL terminals, IDEs, and Python processes
- Press `Ctrl+Shift+Esc` → End any `python.exe` processes

### Step 2: Fix Numpy (One Time Fix)
Open a NEW PowerShell window and run:

```powershell
# Navigate to project
cd "C:\Users\mishr\OneDrive\Desktop\Stuffs\SIGN_LANGUAGE_DETECTION\SIGN-LANGUAGE-DETECTION"

# Uninstall corrupted numpy
python -m pip uninstall numpy -y

# Install fresh numpy
python -m pip install numpy

# Verify it works
python -c "import numpy; print('✅ Numpy works!')"
```

### Step 3: Install Missing Packages
```powershell
python -m pip install flask flask-cors opencv-python mediapipe scikit-learn Pillow
```

### Step 4: Run the Backend
```powershell
python app.py
```

You should see:
```
📂 Loading trained model...
✅ Model loaded successfully!
🚀 Starting Flask server...
   API will be available at http://localhost:5000
```

### Step 5: Run the Frontend (New Terminal)
Open a NEW terminal window:

```powershell
cd "C:\Users\mishr\OneDrive\Desktop\Stuffs\SIGN_LANGUAGE_DETECTION\SIGN-LANGUAGE-DETECTION\frontend"
npm install
npm run dev
```

### Step 6: Open in Browser
Go to: **http://localhost:3000**

---

## 🔧 Alternative: If Numpy Still Doesn't Work

If numpy is still corrupted after Step 2, try this:

```powershell
# Remove corrupted files manually
Remove-Item -Recurse -Force "C:\Python311\Lib\site-packages\numpy*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "C:\Python311\Lib\site-packages\~umpy*" -ErrorAction SilentlyContinue

# Install fresh
python -m pip install numpy
```

---

## 🐛 Troubleshooting

**Error: "No module named 'flask'"**
- Solution: `python -m pip install flask flask-cors`

**Error: "numpy.dtype size changed"**
- Solution: `python -m pip install --upgrade scikit-learn`

**Error: "MediaPipe not found"**
- Solution: `python -m pip install mediapipe`

**Error: "Port 5000 already in use"**
- Solution: Close the previous Flask server or change port in app.py

**Error: "Camera not working"**
- Solution: Grant camera permissions in browser settings

---

## ✅ Quick Test Commands

Test if everything is installed:
```powershell
python -c "import flask, cv2, mediapipe, numpy, sklearn; print('✅ All packages work!')"
```

Test if model loads:
```powershell
python -c "import pickle; model = pickle.load(open('model.p', 'rb')); print('✅ Model loads!')"
```

---

## 📝 Summary

1. Close all Python processes
2. Fix numpy: `python -m pip uninstall numpy -y && python -m pip install numpy`
3. Install packages: `python -m pip install flask flask-cors opencv-python mediapipe scikit-learn Pillow`
4. Run backend: `python app.py`
5. Run frontend: `cd frontend && npm install && npm run dev`
6. Open browser: http://localhost:3000

That's it! 🎉


