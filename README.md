
npm run start-urls -- --url https://www.flashscore.com/basketball/spain/acb 

npm run start newUrl=https://www.flashscore.com/basketball/spain/acb/results/ generateCSV=true headless

npm run start country=spain league=acb action=results generateCSV=true headless

npm run start ids=g_3_Uix0vJJK includeMatchData=true headless

npm run start ids=g_3_Uix0vJJK includeStatsPlayer=true headless OK
 
npm run start ids=g_3_Uix0vJJK includeStatsMatch=true headless NO

npm run start ids=g_3_Uix0vJJK includePointByPoint=true headless OK

npm run start read-csv

docker build -t nombre_imagen .

docker run --rm docker-ppt npm run start-urls -- --url https://www.flashscore.com/basketball/spain/acb

docker run --rm docker-ppt npm run start-urls -- --url https://www.flashscore.com/basketball/spain/acb

npm run start country=spain league=acb action=results generateCSV=true headless
