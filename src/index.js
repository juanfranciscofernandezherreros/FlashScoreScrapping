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
  let ids = null;
  let headless = false;
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
      console.log("ID", ids);
      let thirdParameter = 0;
      let pointByPointResult;
      let statsMatchResult;
      let iterations = 0;
      
      // Llama a getMatchData con el ID proporcionado
      const matchData = await getMatchData(browser, ids);
      console.log("Match Data:", matchData);
      const statsPlayer = await getStatsPlayer(browser, ids);
      console.log("Stats Player:", statsPlayer);
      

      do {
        // Llama a getPointByPoint con el ID y tercer parámetro proporcionados
        pointByPointResult = await getPointByPoint(browser, ids, thirdParameter);
        console.log("PointByPoint:", pointByPointResult);

        // Llama a getStatsMatch con el ID y tercer parámetro proporcionados
        statsMatchResult = await getStatsMatch(browser, ids, thirdParameter);
        console.log("StatsMatch:", statsMatchResult);

        // Incrementa el tercer parámetro para la próxima iteración
        thirdParameter++;
        iterations++;
      } while ((pointByPointResult && statsMatchResult) && iterations < 5);
    } else {
      allMatchIdLists = await getMatchIdList(browser, country, league);
      for (const matchIdListObject of allMatchIdLists.matchIdList) {
        console.log(matchIdListObject);
      }
    }
    await browser.close();
  }
})();
