#!/usr/bin/env python
"""
Wrapper script to ensure correct Python interpreter is used and dependencies are installed
"""
import sys
import subprocess
import os

print(f"🐍 Using Python: {sys.executable}")
print(f"📁 Working directory: {os.getcwd()}")

# Check if Flask is installed
try:
    import flask
    print(f"✅ Flask found (version: {flask.__version__})")
except ImportError:
    print("❌ Flask not found. Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed!")
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        sys.exit(1)

# Check other critical dependencies
missing = []
for module in ['flask_cors', 'cv2', 'mediapipe', 'numpy', 'PIL']:
    try:
        if module == 'PIL':
            __import__('PIL')
        elif module == 'cv2':
            __import__('cv2')
        else:
            __import__(module)
    except ImportError:
        missing.append(module)

if missing:
    print(f"⚠️ Missing modules: {missing}")
    print("Installing all requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

# Now run the app
print("\n🚀 Starting Flask server...\n")
if __name__ == "__main__":
    import app

