@echo off
echo Fixing corrupted numpy installation...
echo.
echo Step 1: Please close ALL Python processes and terminals
echo Step 2: Press any key when ready to continue...
pause

echo.
echo Uninstalling corrupted numpy...
python -m pip uninstall numpy -y

echo.
echo Installing fresh numpy...
python -m pip install numpy

echo.
echo Testing numpy...
python -c "import numpy; print('✅ Numpy version:', numpy.__version__)"

echo.
echo Done! Try running: python app.py
pause


