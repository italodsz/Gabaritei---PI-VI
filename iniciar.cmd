@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title Gabaritei - Recomendador de questoes
set "GABARITEI_PASTA=%LOCALAPPDATA%\GabariteiRecomendador"
if defined GABARITEI_LOCAL set "GABARITEI_PASTA=%GABARITEI_LOCAL%"
if exist "%GABARITEI_PASTA%\ambiente\Scripts\python.exe" goto ambiente
py -3 -c "import sys; sys.exit(not (sys.version_info >= (3, 11)))" >nul 2>&1
if not errorlevel 1 goto launcher
python -c "import sys; sys.exit(not (sys.version_info >= (3, 11)))" >nul 2>&1
if not errorlevel 1 goto python
echo Instale Python 3.11 ou superior em https://www.python.org/downloads/
echo Durante a instalacao, habilite a opcao de adicionar o Python ao PATH.
set "RESULTADO=1"
goto fim
:launcher
py -3 -X utf8 recomendador\iniciar.py %*
set "RESULTADO=%ERRORLEVEL%"
goto fim
:python
python -X utf8 recomendador\iniciar.py %*
set "RESULTADO=%ERRORLEVEL%"
goto fim
:ambiente
"%GABARITEI_PASTA%\ambiente\Scripts\python.exe" -X utf8 recomendador\iniciar.py %*
set "RESULTADO=%ERRORLEVEL%"
:fim
echo.
pause
exit /b %RESULTADO%
