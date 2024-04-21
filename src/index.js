import puppeteer from "puppeteer";
import { generateCSVData, generateCSVSummary, generateCSVPlayerStats, generateCSVStatsMatch } from "./csvGenerator.js";
import { formatFecha } from "./fecha.js";

import {
  getMatchIdList,
  getFixtures,
  getMatchData,
  getStatsPlayer,
  getStatsMatch,
} from "./utils/index.js";

(async () => {
  let country = null;
  let league = null;
  let newUrl = null;
  let ids = null;
  let includeMatchData = false;
  let includeStatsPlayer = false;
  let includeStatsMatch = false;

  process.argv.slice(2).forEach(arg => {
    if (arg.includes("country="))
      country = arg.split("country=")?.[1] ?? country;
    if (arg.includes("newUrl=")) {
      const newUrlArg = arg.split("newUrl=")?.[1];
      if (newUrlArg) {
        newUrl = newUrlArg;
      }
    }
    if (arg.includes("league="))
      league = arg.split("league=")?.[1] ?? league;
    if (arg.includes("ids="))
      ids = arg.split("ids=")?.[1]?.split(",") ?? ids;
    if (arg.includes("includeMatchData=true"))
      includeMatchData = true;
    if (arg.includes("includeStatsPlayer=true"))
      includeStatsPlayer = true;
    if (arg.includes("includeStatsMatch=true"))
      includeStatsMatch = true;
  });

  const browser = await puppeteer.launch({ headless: true }); // Cambio aquí

  if (ids) {
    const modifiedIds = ids.map(id => id.split("_")[2]);
    if (includeMatchData) {
      console.log("INCLUDE MATCH DATA", includeMatchData);
      const allMatchData = await getMatchData(browser, modifiedIds);
      const nombreArchivo = `src/csv/MATCH_SUMMARY_${ids}`;
      generateCSVSummary(allMatchData, nombreArchivo);
    }
    if (includeStatsPlayer) {
      console.log("INCLUDE STATS PLAYER", includeStatsPlayer);
      const allStatsPlayer = await getStatsPlayer(browser, modifiedIds);
      const nombreArchivo = `src/csv/STATS_PLAYER_${ids}`;
      generateCSVPlayerStats(allStatsPlayer, nombreArchivo);
    }
    if (includeStatsMatch) {
      console.log("INCLUDE STATS MATCH", includeStatsMatch);
      for (let i = 0; i <= 5; i++) {
          const allStatsMatch = await getStatsMatch(browser, modifiedIds, i);
          const nombreArchivo = `src/csv/STATS_MATCH_${ids}_${i}`;
          generateCSVStatsMatch(allStatsMatch, nombreArchivo);
      }
    }
  
  } else if (newUrl) {
    console.log("New URL is provided:", newUrl);
    if (newUrl.includes("results")) {
      const urlParts = newUrl.split("/");
      const country = urlParts[4];
      const league = urlParts[5];
      const allMatchIdLists = await getMatchIdList(browser, country, league);
      console.log("Generando archivo CSV...");
      const fechaActual = new Date();
      const formattedFecha = formatFecha(fechaActual);
      const nombreArchivo = `src/csv/RESULTS_${formattedFecha}_${country}_${league}`;
      generateCSVData(allMatchIdLists.eventDataList, nombreArchivo);
    } else if (newUrl.includes("fixtures")) {
      console.log("FIXTURES");
      const urlParts = newUrl.split("/");
      const country = urlParts[4];
      const league = urlParts[5];
      const allFixturesLists = await getFixtures(browser, country, league);
      console.log("Generando archivo CSV...");
      const fechaActual = new Date();
      const formattedFecha = formatFecha(fechaActual);
      const nombreArchivo = `src/csv/FIXTURES_${formattedFecha}_${country}_${league}`;
      generateCSVData(allFixturesLists, nombreArchivo);
    }
  } else {
    console.log("New URL is not provided. It's null or empty.");
    console.log("Argument country ", country);
    console.log("Argument league ", league);
    const allMatchIdLists = await getMatchIdList(browser, country, league);
    console.log("Generando archivo CSV...");
    const fechaActual = new Date();
    const formattedFecha = formatFecha(fechaActual);
    const nombreArchivo = `src/csv/RESULTS_${formattedFecha}_${country}_${league}`;
    generateCSVData(allMatchIdLists.eventDataList, nombreArchivo);
  }

  await browser.close();
})();
