@echo off

setlocal

rem Change directory to fractal-visualizer
cd "fractal-visualizer"

rem Start the server using npx serve
start cmd /c "npx serve -l 5500 -s build"

rem Run npm run start-server
start cmd /c "npm run start-server"

rem Change directory back to the root folder
cd ".."

rem Run the Java JAR file
start cmd /c java -jar "build/libs/FractalSim-1.0-SNAPSHOT.jar"

rem Change directory back to electron-app
cd ".\electron-app\"

rem Run npm start for Electron app
start cmd /c "npm start"

rem Get the PID of the Electron app process
for /f "tokens=2 delims==;" %%P in ('wmic process where "CommandLine like '%%electron.cmd start%%'" get ProcessId /value') do (
  set "electronAppPID=%%P"
)

rem Wait for the Electron app to start
:waitForElectronAppStart
timeout /t 2 /nobreak >nul
tasklist /fi "PID eq %electronAppPID%" | findstr /i "%electronAppPID%" >nul
if errorlevel 1 (
  goto :waitForElectronAppStart
)

rem Monitor the status of the Electron app
:waitForElectronAppClose
timeout /t 2 /nobreak >nul
tasklist /fi "PID eq %electronAppPID%" | findstr /i "%electronAppPID%" >nul
if errorlevel 1 (
  echo "KILLING"
  exit /b
) else (
  goto :waitForElectronAppClose
)
