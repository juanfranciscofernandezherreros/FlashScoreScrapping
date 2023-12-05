import puppeteer from "puppeteer";

import {
  getMatchIdList,
  getFixtures,
  getMatchData,
  writeMatchData,
  getStatsPlayer,
  getStatsMatch,
  getPointByPoint,
  existData
} from "./utils/index.js";

import { getUrls } from './urls.js';

(async () => {
  let country = null;
  let league = null;
  let ids = null;
  let headless = false;
  let path = "./src/data";
  let pathfixtures = "./src/data-fixtures";
  let action = "results";
  process.argv?.slice(2)?.map(arg => {
    if (arg.includes("country="))
      country = arg.split("country=")?.[1] ?? country;
    if (arg.includes("league="))
      league = arg.split("league=")?.[1] ?? league;
    if (arg.includes("headless"))
      headless = true;
    if (arg.includes("path="))
      path = arg.split("path=")?.[1] ?? path;
    if (arg.includes("action="))
      action = arg.split("action=")?.[1] ?? action;
    if (arg.includes("ids="))
      ids = arg.split("ids=")?.[1] ?? ids;
  })

  if (country === null && league === null && action === "urls") {
    getUrls()
    return;
  }

  let matchIdList = null;

  if (action === "fixtures") {
    const browser = await puppeteer.launch({ headless });
    const combinedData = await getFixtures(browser, country, league);
    writeMatchData(combinedData, pathfixtures, `calendar-${country}-${league}`);
    await browser.close();
  } else if (action === "results") {
    const browser = await puppeteer.launch({ headless });

    if (ids !== null) {
      matchIdList = ids;
      
      const matchData = await getMatchData(browser, ids);
      const statsPlayer = await getStatsPlayer(browser, ids);
      const statsMatch_all = await getStatsMatch(browser, ids, 0);
      const statsMatch_first = await getStatsMatch(browser, ids, 1);
      const statsMatch_second = await getStatsMatch(browser, ids, 2);
      const statsMtach_thirst = await getStatsMatch(browser, ids, 3);
      const statsMtach_four = await getStatsMatch(browser, ids, 4);
      let statsMtach_five = null;
      let pointByPoint_four = null;
      const pointByPoint = await getPointByPoint(browser, ids, 0);
      const pointByPoint_first = await getPointByPoint(browser, ids, 1);
      const pointByPoint_second = await getPointByPoint(browser, ids, 2);
      const pointByPoint_thirst = await getPointByPoint(browser, ids, 3);

      if (matchData.extraLocal !== '' && matchData.extraAway !== '') {
        statsMtach_five = await getStatsMatch(browser, ids, 5);
        pointByPoint_four = await getPointByPoint(browser, ids, 4);
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
      writeMatchData(combinedData, path, `${ids}-${country}-${league}`);
    } else {
      matchIdList = await getMatchIdList(browser, country, league);
    }
    console.log(matchIdList);
    await browser.close();
  }
})();
