
npm run start-urls -- --url https://www.flashscore.com/basketball/spain/acb 

npm run start country=spain league=acb action=fixtures generateCSV=true headless

npm run start country=spain league=acb action=results generateCSV=true headless

npm run start country=spain league=acb action=results ids=g_3_EVvGhsts includeMatchData=true includeStatsPlayer=false includeStatsMatch=false includePointByPoint=false generateCSV=true  headless

---

docker build -t flashscore-scraping:1.0.0 .


docker run flashscore-scraping:1.0.0
