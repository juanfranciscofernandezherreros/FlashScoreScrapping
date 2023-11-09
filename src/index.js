import puppeteer from "puppeteer";
import cliProgress from 'cli-progress';

import { getMatchIdList, getFixtures, getMatchData, writeMatchData, getStatsPlayer, getStatsMatch, getPointByPoint, existData } from "./utils/index.js";
import { getUrls } from './urls.js';

(async () => {
  let country = null;
  let league = null;
  let headless = false;
  let path = "./src/data";
  let pathfixtures = "./src/data-fixtures";
  let action = "results"; // Por defecto, establece la acción en "fixtures"
  process.argv?.slice(2)?.map(arg => {
    if (arg.includes("country="))
      country = arg.split("country=")?.[1] ?? country;
    if (arg.includes("league="))
      league = arg.split("league=")?.[1] ?? league;
    if (arg.includes("headless"))
      headless = "new";
    if (arg.includes("path="))
      path = arg.split("path=")?.[1] ?? path;
    if (arg.includes("action=")) // Nuevo argumento "action"
      action = arg.split("action=")?.[1] ?? action;
  })

  if (!country || !league) {
    console.log("ERROR: You did not define country or league flags.");
    console.log("Documentation can be found at https://github.com/gustavofariaa/FlashscoreScraping");
    return;
  }

  // Obtener los datos de combinedData
  if (action === "fixtures") {
    const browser = await puppeteer.launch({ headless });
    const combinedData = await getFixtures(browser, country, league);
    writeMatchData(combinedData, pathfixtures, `calendar-${country}-${league}`);
    await browser.close(); // Cerrar el navegador después de las operaciones
  } else if (action === "results") {
    const browser = await puppeteer.launch({ headless });
    const matchIdList = await getMatchIdList(browser, country, league);
    let totalIds = matchIdList.length;
    const matchIds = existData(matchIdList, path, `${country}-${league}`);
    const progressBar = new cliProgress.SingleBar({
      format: 'Progress {bar} {percentage}% | {value}/{total}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });
    progressBar.start(matchIds.length, 0);

    for (const matchId of matchIds) {
      const matchData = await getMatchData(browser, matchId);
      const statsPlayer = await getStatsPlayer(browser, matchId);
      const statsMatch_all = await getStatsMatch(browser, matchId,0);
      const statsMatch_first = await getStatsMatch(browser, matchId,1);
      const statsMatch_second = await getStatsMatch(browser, matchId,2);
      const statsMtach_thirst = await getStatsMatch(browser, matchId,3);
      const statsMtach_four = await getStatsMatch(browser, matchId,4);    
      let statsMtach_five = null;    
      let pointByPoint_four = null;
      const pointByPoint = await getPointByPoint(browser, matchId,0);
      const pointByPoint_first = await getPointByPoint(browser, matchId,1);
      const pointByPoint_second = await getPointByPoint(browser, matchId,2);
      const pointByPoint_thirst = await getPointByPoint(browser, matchId,3);

      if (matchData.extraLocal !== '' && matchData.extraAway !== '') {
        statsMtach_five = await getStatsMatch(browser, matchId, 5);
        pointByPoint_four = await getPointByPoint(browser, matchId, 4);
      }
        
      const combinedData = {
        matchData: matchData,
        statsPlayer: statsPlayer, 
        statsMatch_all: statsMatch_all,
        statsMatch_first: statsMatch_first,
        statsMatch_second: statsMatch_second,
        statsMtach_thirst: statsMtach_thirst,
        statsMtach_four: statsMtach_four,      
        statsMtach_five: statsMtach_five,      
        pointByPoint: pointByPoint,
        pointByPoint_first: pointByPoint_first,
        pointByPoint_second: pointByPoint_second,
        pointByPoint_thirst: pointByPoint_thirst,
      };
      writeMatchData(combinedData, path, `${matchId}-${country}-${league}`)
      progressBar.increment();
      progressBar.stop();
      await browser.close();
      
  }

    progressBar.stop();
    await browser.close(); // Cerrar el navegador después de las operaciones en el bucle
  }
})();
