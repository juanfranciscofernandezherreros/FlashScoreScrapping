import puppeteer from "puppeteer";

import {
  getMatchIdList,
  getFixtures,
  getMatchData,
  getStatsPlayer,
  getStatsMatch,
  getPointByPoint
} from "./utils/index.js";

(async () => {
  let country = null;
  let league = null;
  let headless = false;
  let action = "results";
  let ids = null;
  let includeMatchData = true; // Default value is true

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
      ids = arg.split("ids=")?.[1]?.split(",") ?? ids;
    if (arg.includes("includeMatchData="))
      includeMatchData = arg.split("includeMatchData=")?.[1]?.toLowerCase() === "true";
  });

  let allMatchIdLists = [];

  if (action === "fixtures") {
    const browser = await puppeteer.launch({ headless });
    const combinedData = await getFixtures(browser, country, league);
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
      for (const id of ids) {
        console.log("ID", id);
        if (includeMatchData) {
          const matchData = await getMatchData(browser, id);
          console.log("Match Data:", matchData);
        }
        const statsPlayer = await getStatsPlayer(browser, id);
        console.log("Stats Player:", statsPlayer);
        const statsMatch = await getStatsMatch(browser, id, 0);
        console.log("StatsMatch:", statsMatch);
        const pointByPoint = await getPointByPoint(browser, id, 0);
        console.log("PointByPoint:", pointByPoint);
      }
    } else {
      allMatchIdLists = await getMatchIdList(browser, country, league);
      for (const matchIdListObject of allMatchIdLists.matchIdList) {
        console.log(matchIdListObject);
      }
    }
    await browser.close();
  }
})();
