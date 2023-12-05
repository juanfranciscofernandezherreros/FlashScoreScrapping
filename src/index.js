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

  let allMatchIdLists = [];

  if (action === "fixtures") {
    const browser = await puppeteer.launch({ headless });
    const combinedData = await getFixtures(browser, country, league);
    writeMatchData(combinedData, pathfixtures, `calendar-${country}-${league}`);
    await browser.close();
    console.log("[");
    console.log(allMatchIdLists.additionalContent);
    for (const combined of combinedData) {
      console.log(combined);
    }
    console.log("]");
    return combinedData;
  } else if (action === "results") {
    const browser = await puppeteer.launch({ headless });

    if (ids !== null) {
      allMatchIdLists.push(ids);
    } else {
      allMatchIdLists = await getMatchIdList(browser, country, league);
    }
    console.log("[");
    console.log(allMatchIdLists.additionalContent);
    for (const matchIdListObject of allMatchIdLists.matchIdList) {
      console.log(matchIdListObject);
    }
    console.log("]");
    await browser.close();

  }
})();
