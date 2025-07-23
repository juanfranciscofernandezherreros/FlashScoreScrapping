REM 1) Resultados de Euoleague 2024-2025

docker build -t flashscore-scrapping .

docker run --rm --name flashscore-scrapping -v "C:\output":/app/src/csv ^ puppeteer-scraper country=spain league=acb action=results

docker run --rm --name csv-results ^
-e DB_URL=jdbc:postgresql://host.docker.internal:5433/spring-batch-example ^
-e DB_USER=postgresql ^
-e DB_PASS=postgresql ^
-v "C:\output\results\europe_euroleague-1999-2000\RESULTS_20250721104739_spain_acb.csv:/app/RESULTS_20250721104739_spain_acb" ^
-p 8080:8080 ^

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

  npm run start ids=g_3_r9gkd0Jk includeMatchData=true headless=true