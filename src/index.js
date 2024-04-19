import puppeteer from "puppeteer";
import { generateCSVResultsMatchs } from "./csvGenerator.js";
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
    console.log("generateCSV", generateCSV);
    console.log("Generando archivo CSV...");
    const fechaActual = new Date();
    const formattedFecha = formatFecha(fechaActual);
    const nombreArchivo = `RESULTS_${formattedFecha}_${country}_${league}`;
    generateCSVResultsMatchs(allMatchIdLists.eventDataList, nombreArchivo);
  } else {
    console.log("New URL is provided:", newUrl);
    const browser = await puppeteer.launch({ headless });
    console.log("----");
    const urlParts = newUrl.split("/"); // Divide la URL en partes usando "/"
    // El país estará en la posición 4 y la liga en la posición 5, si la URL sigue un formato específico
    const country = urlParts[4];
    const league = urlParts[5];
    allMatchIdLists = await getMatchIdList(browser, country, league);
    console.log("generateCSV", generateCSV);
    console.log("Generando archivo CSV...");
    const fechaActual = new Date();
    const formattedFecha = formatFecha(fechaActual);
    const nombreArchivo = `RESULTS_${formattedFecha}_${country}_${league}`;
    generateCSVResultsMatchs(allMatchIdLists.eventDataList, nombreArchivo);
  }
})();