import fs from 'fs';
import path from 'path';
import puppeteer from "puppeteer";
import {
  generateCSVDataResults,
  generateCSVFromObject,
  generateCSVPlayerStats,
  generateCSVStatsMatch,
  generateCSVData,
  generateCSVPointByPoint
} from "./csvGenerator.js";
import { formatFecha } from "./fecha.js";
import {
  getFixtures,
  getMatchIdList,
  getStatsMatch,
  getMatchData,
  getStatsPlayer,
  getPointByPoint
} from "./utils/index.js";

const getFormattedDate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}_${month}_${year}`;
};

const logInfo = (msg) => console.log(`[INFO] ${msg}`);
const logWarning = (msg) => console.warn(`[WARNING] ${msg}`);
const logError = (matchId, args, msg) => console.error(`[ERROR] matchId=${matchId}, args=${JSON.stringify(args)} - ${msg}`);

const createFolderIfNotExist = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    logInfo(`Created folder: ${folderPath}`);
  } else {
    logInfo(`Folder already exists: ${folderPath}`);
  }
};

const generateMatchCSVs = async (browser, match, competitionFolderPath, includeOptions) => {
  const matchId = match.matchId.replace('g_3_', '');
  const matchFolderPath = competitionFolderPath;
  const matchUrl = `https://example.com/match/${matchId}`;

  createFolderIfNotExist(matchFolderPath);

  if (includeOptions.includeMatchData) {
    const matchFilePath = path.join(matchFolderPath, `MATCH_SUMMARY_${match.matchId}.csv`);
    if (!fs.existsSync(matchFilePath)) {
      const data = await getMatchData(browser, matchId);
      generateCSVFromObject(data, matchFilePath.replace('.csv', ''));
      logInfo(`Generated MATCH_SUMMARY for ${match.matchId}`);
    } else {
      logWarning(`MATCH_SUMMARY already exists for ${match.matchId}`);
    }
  }

  if (includeOptions.includeStatsPlayer) {
    const matchFilePath = path.join(matchFolderPath, `STATS_PLAYER_${match.matchId}.csv`);
    if (!fs.existsSync(matchFilePath)) {
      const data = await getStatsPlayer(browser, matchId);
      generateCSVPlayerStats(data, matchFilePath.replace('.csv', ''));
      logInfo(`Generated STATS_PLAYER for ${match.matchId}`);
    } else {
      logWarning(`STATS_PLAYER already exists for ${match.matchId}`);
    }
  }

  if (includeOptions.includeStatsMatch) {
    for (let i = 0; i <= 4; i++) {
      const matchFilePath = path.join(matchFolderPath, `STATS_MATCH_${match.matchId}_${i}.csv`);
      if (!fs.existsSync(matchFilePath)) {
        const data = await getStatsMatch(browser, matchId, i);
        generateCSVStatsMatch(data, matchFilePath.replace('.csv', ''));
        logInfo(`Generated STATS_MATCH for ${match.matchId}, set ${i}`);
      } else {
        logWarning(`STATS_MATCH already exists for ${match.matchId}, set ${i}`);
      }
    }
  }

  if (includeOptions.includePointByPoint) {
    for (let i = 0; i <= 4; i++) {
      const matchFilePath = path.join(matchFolderPath, `POINT_BY_POINT_${match.matchId}_${i}.csv`);
      if (!fs.existsSync(matchFilePath)) {
        const data = await getPointByPoint(browser, matchId, i);
        generateCSVPointByPoint(data, matchFilePath.replace('.csv', ''), match.matchId);
        logInfo(`Generated POINT_BY_POINT for ${match.matchId}, set ${i}`);
      } else {
        logWarning(`POINT_BY_POINT already exists for ${match.matchId}, set ${i}`);
      }
    }
  }
};

(async () => {
  const args = {
    country: null,
    ids: null,
    league: null,
    competition: null,
    action: null,
    includeMatchData: false,
    includeStatsPlayer: false,
    includeStatsMatch: false,
    includePointByPoint: false,
  };

  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith("country=")) args.country = arg.split("country=")[1];
    if (arg.startsWith("ids=")) args.ids = arg.split("ids=")[1];
    if (arg.startsWith("league=")) args.league = arg.split("league=")[1];
    if (arg.startsWith("competition=")) args.competition = arg.split("competition=")[1];
    if (arg.startsWith("action=")) args.action = arg.split("action=")[1];
    if (arg === "includeMatchData=true") args.includeMatchData = true;
    if (arg === "includeStatsPlayer=true") args.includeStatsPlayer = true;
    if (arg === "includeStatsMatch=true") args.includeStatsMatch = true;
    if (arg === "includePointByPoint=true") args.includePointByPoint = true;
  });

  logInfo(`ARGS: ${JSON.stringify(args)}`);

  const baseFolderPath = path.join(process.cwd(), 'src', 'csv');
  const resultsFolderPath = path.join(baseFolderPath, 'results');
  const fixturesFolderPath = path.join(baseFolderPath, 'fixtures');

  const folderName =
    args.competition ?? (args.ids && !args.ids.includes(',') ? args.ids : `${args.country}_${args.league}`);

  const competitionFolderPath = path.join(resultsFolderPath, folderName);

  createFolderIfNotExist(resultsFolderPath);
  createFolderIfNotExist(fixturesFolderPath);
  createFolderIfNotExist(competitionFolderPath);

  const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const includeOptions = {
      includeMatchData: args.includeMatchData,
      includeStatsPlayer: args.includeStatsPlayer,
      includeStatsMatch: args.includeStatsMatch,
      includePointByPoint: args.includePointByPoint,
    };

    if (args.ids !== null) {
      const idList = args.ids.split(',');
      for (const matchId of idList) {
        const match = { matchId };
        try {
          logInfo(`Processing match by ID: ${matchId}`);
          await generateMatchCSVs(browser, match, competitionFolderPath, includeOptions);
        } catch (error) {
          logError(matchId, args, error.message);
        }
      }
    } else if (args.action === "results") {
      const list = await getMatchIdList(browser, args.country, args.league);
      const fechaActual = new Date();
      const formattedFecha = formatFecha(fechaActual);
      const filePath = path.join(competitionFolderPath, `RESULTS_${formattedFecha}_${args.country}_${args.league}.csv`);
      generateCSVDataResults(list.eventDataList, filePath.replace('.csv', ''));
      logInfo(`Generated RESULTS file with ${list.eventDataList.length} matches`);

      for (const match of list.eventDataList) {
        const matchId = match.matchId.replace('g_3_', '');
        try {
          logInfo(`Processing match: ${match.matchId}`);
          await generateMatchCSVs(browser, match, competitionFolderPath, includeOptions);
        } catch (error) {
          logError(matchId, args, error.message);
        }
      }
    } else if (args.action === "fixtures") {
      const fixtures = await getFixtures(browser, args.country, args.league);
      const filePath = path.join(fixturesFolderPath, `FIXTURES_${args.country}_${args.league}.csv`);
      generateCSVData(fixtures, filePath.replace('.csv', ''));
      logInfo("Generated FIXTURES file.");
    }
  } catch (error) {
    logError('N/A', args, error.message);
  } finally {
    await browser.close();
  }
})();
