import puppeteer from "puppeteer";
import cliProgress from 'cli-progress';

import { getMatchIdList, getMatchData, writeMatchData, getStatsPlayer, getStatsMatch, getPointByPoint } from "./utils/index.js";

(async () => {
  let country = null
  let league = null
  let headless = false
  let path = "./src/data"

  process.argv?.slice(2)?.map(arg => {
    if (arg.includes("country="))
      country = arg.split("country=")?.[1] ?? country;
    if (arg.includes("league="))
      league = arg.split("league=")?.[1] ?? league;
    if (arg.includes("headless"))
      headless = "new";
    if (arg.includes("path="))
      path = arg.split("path=")?.[1] ?? path;
  })

  if (!country || !league) {
    console.log("ERROR: You did not define a country or league flags.");
    console.log("Documentation can be found at https://github.com/gustavofariaa/FlashscoreScraping");
    return;
  }

  const browser = await puppeteer.launch({ headless });

  const matchIdList = await getMatchIdList(browser, country, league)

  const progressBar = new cliProgress.SingleBar({
    format: 'Progress {bar} {percentage}% | {value}/{total}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  progressBar.start(matchIdList.length, 0);

  const data = {}
  for (const matchId of matchIdList) {
    const matchData = await getMatchData(browser, matchId);
    const statsPlayer = await getStatsPlayer(browser, matchId);
    const statsMatch_all = await getStatsMatch(browser, matchId,0);
    const statsMatch_first = await getStatsMatch(browser, matchId,1);
    const statsMatch_second = await getStatsMatch(browser, matchId,2);
    const statsMtach_thirst = await getStatsMatch(browser, matchId,3);
    const statsMtach_four = await getStatsMatch(browser, matchId,4);
    /*const statsMtach_extra = await getStatsMatch(browser, matchId,5);*/
    const pointByPoint = await getPointByPoint(browser, matchId,0);
    const pointByPoint_first = await getPointByPoint(browser, matchId,1);
    const pointByPoint_second = await getPointByPoint(browser, matchId,2);
    const pointByPoint_thirst = await getPointByPoint(browser, matchId,3);
    /*const pointByPoint_four = await getPointByPoint(browser, matchId,4);*/

    const combinedData = {
      matchData: matchData,
      statsPlayer: statsPlayer, 
      statsMatch_all: statsMatch_all,
      statsMatch_first: statsMatch_first,
      statsMatch_second: statsMatch_second,
      statsMtach_thirst: statsMtach_thirst,
      statsMtach_four: statsMtach_four,
      /*statsMtach_extra: statsMtach_extra,*/
      pointByPoint: pointByPoint,
      pointByPoint_first: pointByPoint_first,
      pointByPoint_second: pointByPoint_second,
      pointByPoint_thirst: pointByPoint_thirst,
      /*pointByPoint_four: pointByPoint_four,*/
    };
    writeMatchData(combinedData, path, `${matchId}-${country}-${league}`)
    progressBar.increment();
  }

  progressBar.stop();

  await browser.close();
})()
