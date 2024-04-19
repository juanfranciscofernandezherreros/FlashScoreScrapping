import puppeteer from "puppeteer";
import { generateCSVData } from "./csvGenerator.js";
import {formatFecha } from "./fecha.js";

import {
  getMatchIdList,
  getFixtures,
  getMatchData,
  getStatsPlayer,
  getStatsMatch,
  getPointByPoint,
  getDateMatch
} from "./utils/index.js";
import { url } from "inspector";

(async () => {
  let country = null;
  let league = null;
  let newUrl = null;
  let headless = false;
  let action = "results";
  let ids = null;
  let includeMatchData = true; 
  let includeStatsPlayer = true; 
  let includeStatsMatch = true; 
  let includePointByPoint = true; 
  let generateCSV = false;
  let allMatchIdLists = [];
  let allFixturesLists = [];

  process.argv?.slice(2)?.map(arg => {
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
    if (arg.includes("includeStatsPlayer="))
      includeStatsPlayer = arg.split("includeStatsPlayer=")?.[1]?.toLowerCase() === "true";
    if (arg.includes("includeStatsMatch="))
      includeStatsMatch = arg.split("includeStatsMatch=")?.[1]?.toLowerCase() === "true";
    if (arg.includes("includePointByPoint="))
      includePointByPoint = arg.split("includePointByPoint=")?.[1]?.toLowerCase() === "true"    
    if (arg.includes("generateCSV="))
        generateCSV = arg.split("generateCSV=")?.[1]?.toLowerCase() === "true";
  });
  
  if (newUrl === null || newUrl === "") {
    console.log("New URL is not provided. It's null or empty.");  
    const browser = await puppeteer.launch({ headless });
    console.log("Argument country ", country);
    console.log("Argument league ", league);
    allMatchIdLists = await getMatchIdList(browser, country, league);
    console.log("generateCSV", generateCSVData);
    console.log("Generando archivo CSV...");
    const fechaActual = new Date();
    const formattedFecha = formatFecha(fechaActual);
    const nombreArchivo = `RESULTS_${formattedFecha}_${country}_${league}`;
    generateCSVData(allMatchIdLists.eventDataList, nombreArchivo);
  } else {
    console.log("New URL is provided:", newUrl);
    const browser = await puppeteer.launch({ headless });
    console.log("----");
    if (newUrl.includes("results")) {
      const urlParts = newUrl.split("/"); 
      const country = urlParts[4];
      const league = urlParts[5];
      allMatchIdLists = await getMatchIdList(browser, country, league);
      console.log("generateCSV", generateCSVData);
      console.log("Generando archivo CSV...");
      const fechaActual = new Date();
      const formattedFecha = formatFecha(fechaActual);
      const nombreArchivo = `src/csv/RESULTS_${formattedFecha}_${country}_${league}`;
      generateCSVData(allMatchIdLists.eventDataList, nombreArchivo);
    }
    if (newUrl.includes("fixtures")) {
      console.log("FIXTURES");
      const urlParts = newUrl.split("/"); 
      const country = urlParts[4];
      const league = urlParts[5];
      allFixturesLists = await getFixtures(browser, country, league);
      console.log("generateCSV", generateCSVData);
      console.log("Generando archivo CSV...");
      const fechaActual = new Date();
      const formattedFecha = formatFecha(fechaActual);
      const nombreArchivo = `src/csv/FIXTURES_${formattedFecha}_${country}_${league}`;
      generateCSVData(allFixturesLists, nombreArchivo);
    }
  }
})();