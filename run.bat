@echo off
setlocal enabledelayedexpansion

set "batchFileName=%~nx0"

rem Define an array to store the start commands of the processes
set "startCommands[0]=npx serve -l 5500 -s build -n"
set "startCommands[1]=npm run start-server"
set "startCommands[2]=java -jar "build/libs/FractalSim-1.0-SNAPSHOT.jar""
set "startCommands[3]=npm start"

rem Change directory to fractal-visualizer
cd "fractal-visualizer"

rem Start the server using npx serve
start cmd /c "%startCommands[0]%"

rem Run npm run start-server
start cmd /c "%startCommands[1]%"

rem Change directory back to the root folder
cd ".."

rem Run the Java JAR file
start cmd /c "%startCommands[2]%"

rem Change directory back to electron-app
cd ".\electron-app\"

rem Run npm start for Electron app
start cmd /c "%startCommands[3]%"

rem Wait for the Electron app process to start
rem timeout /t 7 /nobreak >nul

rem :checkLoop
rem Delay for a few seconds before checking again
rem timeout /t 3 /nobreak >nul

rem Check if the Electron app process is running
rem tasklist /fi "IMAGENAME eq electron.exe" | find /i "electron.exe" >nul


rem Kill the processes by their PIDs
rem taskkill /f /pid %PID1% %PID2%


rem If the error level is 0, the process is running
rem if %errorlevel% equ 0 (
    rem Add your desired actions here when the process is running.
    rem You can continue with the loop or exit the batch file if needed.
rem    goto checkLoop
rem ) else (
    rem echo Electron app is not running.

    rem echo Killing Processes...
    rem call taskkill /f /t /fi "USERNAME eq %USERNAME%" /fi "IMAGENAME eq cmd.exe"

    REM Kill the process later using the captured PID

    rem echo All processes started by the batch file have been terminated.

    rem Exit the loop
rem    exit /b
rem )
