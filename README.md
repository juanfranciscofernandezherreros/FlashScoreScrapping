REM 1) Resultados de Euoleague 2024-2025

docker run --rm --name puppeteer-scraper -v "C:\output":/app/src/csv ^ puppeteer-scraper country=spain league=acb action=results


docker run --rm ^
  -v "C:\output":/app/src/csv ^
  flashscore ^
  start ^
  country=europe ^
  league=euroleague-2023-2024 ^
  action=results ^
  headless=true

REM 2) Scrapear un partido específico (estadísticas de jugadores)
docker run --rm ^
  -v "C:\output":/app/src/csv ^
  flashscore ^
  start ^
  ids=g_3_r9gkd0Jk ^
  includeStatsPlayer=true ^
  headless=true

REM 3) Scrapear punto a punto de un partido
docker run --rm ^
  -v "C:\output":/app/src/csv ^
  flashscore ^
  start ^
  ids=g_3_r9gkd0Jk ^
  includePointByPoint=true ^
  headless=true

REM 4) Scrapear estadísticas del partido
docker run --rm ^
  -v "C:\output":/app/src/csv ^
  flashscore ^
  start ^
  ids=g_3_r9gkd0Jk ^
  includeStatsMatch=true ^
  headless=true
  
  REM 2) Match Data
docker run --rm ^
  -v "C:\output":/app/src/csv ^
  flashscore ^
  start ^
  ids=g_3_r9gkd0Jk ^
  includeMatchData=true ^
  headless=true