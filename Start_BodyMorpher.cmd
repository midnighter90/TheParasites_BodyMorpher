@echo off
setlocal
set "TOOL_DIR=%~dp0"
set "NODE_EXE=%TOOL_DIR%runtime\node.exe"
set "APP=%TOOL_DIR%app\BodyMorpher.mjs"

if not exist "%NODE_EXE%" (
  echo Portable node.exe is missing: "%NODE_EXE%"
  pause
  exit /b 1
)

if not exist "%APP%" (
  echo BodyMorpher app is missing: "%APP%"
  pause
  exit /b 1
)

"%NODE_EXE%" "%APP%" %*
set "EXITCODE=%ERRORLEVEL%"
echo.
if not "%EXITCODE%"=="0" echo Tool exited with error code %EXITCODE%.
pause
exit /b %EXITCODE%
