@echo off
setlocal enabledelayedexpansion

REM === CONFIGURACIÓN GENERAL ===
set "COUNTRY=spain"
set "COMPETITION_BASE=acb"
set "BASE_RESULTS_FOLDER=src\csv\results"

echo 🔁 Iniciando generación de archivos RESULTS solo si faltan...

REM === RANGO DE TEMPORADAS (1998 a 2024) ===
for /L %%Y in (2000,1,2024) do (
    set /A NEXT=%%Y + 1
    set "SEASON=%%Y-!NEXT!"
    set "COMPETITION=%COMPETITION_BASE%-!SEASON!"
    set "CSV_FOLDER=%BASE_RESULTS_FOLDER%\%COUNTRY%_!COMPETITION!"

    REM === Comprobar si existe algún archivo CSV dentro de la carpeta ===
    if exist "!CSV_FOLDER!\*.csv" (
        echo ✅ Ya existe archivo RESULTS para temporada !SEASON!, se omite.
    ) else (
        echo 🟡 No existe RESULTS para !SEASON!, generando...
        call npm run start -- action=results country=%COUNTRY% league=!COMPETITION! includeMatchData=false
    )

    echo ----------------------------------------------
)

echo.
echo ✅ Proceso completado.
pause
