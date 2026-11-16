@echo off
rem Preview server for JieQi ShiDan (ASCII only, safe encoding)
cd /d %~dp0
start "" http://127.0.0.1:8977
where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 8977
) else (
  py -m http.server 8977
)
pause
