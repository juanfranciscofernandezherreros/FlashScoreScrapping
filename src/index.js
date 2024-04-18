import puppeteer from "puppeteer";
import fs from "fs";

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
  let includeMatchData = true; // Default value is true
  let includeStatsPlayer = true; // Default value is true
  let includeStatsMatch = true; // Default value is true
  let includePointByPoint = true; // Default value is true
  let generateCSV = false; // Nuevo argumento para generar CSV  

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
  } else {
    console.log("New URL is provided:", newUrl);
    // Aquí puedes agregar cualquier acción adicional que desees realizar si la URL no está vacía
  }
})();
