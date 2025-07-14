
npm run start-urls -- --url https://www.flashscore.com/basketball/spain/acb 

npm run start ids=g_3_Y7qHZ2Wo includeStatsPlayer=true headless
 
npm run start ids=g_3_Y7qHZ2Wo includePointByPoint=true headless

npm run start ids=g_3_Y7qHZ2Wo includeStatsMatch=true headless=true

npm run start country=usa league=wnba action=results headless

npm run results -- spain acb-2005-2006 true false false false

npm run fixtures -- world olympic-games

docker build -t flashscore-ppt:v1 .

docker run --rm ^
  -v C:\output:/app/src/csv ^
  flashscore-ppt:v1 start country=europe league=eurobasket-u20 action=results headless=true


npm run start country=europe league=eurobasket-u20 action=fixtures headless
