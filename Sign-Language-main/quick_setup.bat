@echo off
echo ========================================
echo Sign Language Detection - Quick Setup
echo ========================================
echo.

echo Step 1: Fixing numpy...
python -m pip uninstall numpy -y
python -m pip install numpy
if errorlevel 1 (
    echo ERROR: Failed to install numpy. Please close all Python processes and try again.
    pause
    exit /b 1
)

echo.
echo Step 2: Installing required packages...
python -m pip install flask flask-cors opencv-python mediapipe scikit-learn Pillow
if errorlevel 1 (
    echo ERROR: Some packages failed to install.
    pause
    exit /b 1
)

echo.
echo Step 3: Testing installation...
python -c "import flask, cv2, mediapipe, numpy, sklearn; print('✅ All packages installed successfully!')"
if errorlevel 1 (
    echo WARNING: Some packages may not be working correctly.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run the backend server:
echo   python app.py
echo.
echo To run the frontend (in another terminal):
echo   cd frontend
echo   npm install
echo   npm run dev
echo.
pause


