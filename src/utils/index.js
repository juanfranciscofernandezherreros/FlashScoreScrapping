import fs from "fs";
import path from "path";

import { BASE_URL } from "../constants/index.js";
import { match } from "assert";

export const getMatchIdList = async (browser, country, league) => {
  const page = await browser.newPage();

  const url = `${BASE_URL}/basketball/${country}/${league}/results/`;
  await page.goto(url);
  


  while (true) {
    try {
      await page.evaluate(async _ => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const element = document.querySelector('a.event__more.event__more--static');
        element.scrollIntoView();
        element.click();
      });
    } catch (error) {
      break;
    }
  }

  const matchIdList = await page.evaluate(_ => {
    return Array.from(document.querySelectorAll(".event__match.event__match--static.event__match--twoLine"))
      .map(element => element?.id?.replace("g_1_", ""));
  });

  await page.close();
  return matchIdList;
}

export const getMatchData = async (browser, matchId) => {
  const page = await browser.newPage();  
  const prefix = "g_3_";
  const startIndex = matchId.indexOf(prefix) + prefix.length;
  const match = matchId.substring(startIndex);
  const url = `${BASE_URL}/match/${match}/#/match-summary/match-summary`;
  await page.goto(url);
  await new Promise(resolve => setTimeout(resolve, 1500));

  const data = await page.evaluate(async _ => ({
    date: document.querySelector(".duelParticipant__startTime")?.outerText,
    home: {
      name: document.querySelector(".duelParticipant__home .participant__participantName.participant__overflow")?.outerText,
      image: document.querySelector(".duelParticipant__home .participant__image")?.src
    },
    away: {
      name: document.querySelector(".duelParticipant__away .participant__participantName.participant__overflow")?.outerText,
      image: document.querySelector(".duelParticipant__away .participant__image")?.src
    },
    result: {
      home: Array.from(document.querySelectorAll(".detailScore__wrapper span:not(.detailScore__divider)"))?.[0]?.outerText,
      away: Array.from(document.querySelectorAll(".detailScore__wrapper span:not(.detailScore__divider)"))?.[1]?.outerText,
    },
    totalLocal: Array.from(document.querySelectorAll(".smh__home.smh__part"))?.[0]?.outerText,
    firstLocal: Array.from(document.querySelectorAll(".smh__home.smh__part"))?.[1]?.outerText,
    secondLocal: Array.from(document.querySelectorAll(".smh__home.smh__part"))?.[2]?.outerText,
    thirstLocal: Array.from(document.querySelectorAll(".smh__home.smh__part"))?.[3]?.outerText,
    fourthLocal: Array.from(document.querySelectorAll(".smh__home.smh__part"))?.[4]?.outerText,
    extraLocal: Array.from(document.querySelectorAll(".smh__home.smh__part"))?.[5]?.outerText,
    totalAway: Array.from(document.querySelectorAll(".smh__away.smh__part"))?.[0]?.outerText,
    firstAway: Array.from(document.querySelectorAll(".smh__away.smh__part"))?.[1]?.outerText,
    secondAway: Array.from(document.querySelectorAll(".smh__away.smh__part"))?.[2]?.outerText,
    thirstAway: Array.from(document.querySelectorAll(".smh__away.smh__part"))?.[3]?.outerText,
    fourthAway: Array.from(document.querySelectorAll(".smh__away.smh__part"))?.[4]?.outerText,
    extraAway: Array.from(document.querySelectorAll(".smh__away.smh__part"))?.[5]?.outerText
  }));
  await page.close();
  return data;
}

export const getStatsPlayer = async (browser, matchId) => {
  const page = await browser.newPage();
  const prefix = "g_3_";
  const startIndex = matchId.indexOf(prefix) + prefix.length;
  const match = matchId.substring(startIndex);
  const url = `${BASE_URL}/match/${match}/#/match-summary/player-statistics/0`;
  await page.goto(url);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const playerData = await page.evaluate(() => {
    const playerRows = document.querySelectorAll("div.playerStatsTable__row");
    const playerData = [];

    const headerCells = document.querySelectorAll(".playerStatsTable__headerCell");
    const statHeaders = [];

    statHeaders.push("TEAM");
    headerCells.forEach((cell) => {      
      statHeaders.push(cell.textContent.trim());
    });

    playerRows.forEach((row) => {
      const playerName = row.querySelector("a[href*='/player/']").textContent;
      const playerStats = Array.from(row.querySelectorAll("div.playerStatsTable__cell")).map((element) =>
        element.textContent.trim()
      );

      // Crear un objeto con todas las estadísticas del jugador
      const playerStatsObject = {};

      // Recorrer todas las estadísticas y agregarlas al objeto
      statHeaders.forEach((header, index) => {
        playerStatsObject[header] = playerStats[index];
      });

      playerData.push({
        name: playerName,
        stats: playerStatsObject,
      });
    });

    return playerData;
  });

  return playerData;
};

export const getStatsMatch = async (browser, matchId, playerIndex) => {
  const page = await browser.newPage();  
  const prefix = "g_3_";
  const startIndex = matchId.indexOf(prefix) + prefix.length;
  const match = matchId.substring(startIndex);
  const url = `${BASE_URL}/match/${match}/#/match-summary/match-statistics/${playerIndex}`;
  await page.goto(url);
  console.log(url);
  await new Promise(resolve => setTimeout(resolve, 1500));
  const data = await page.evaluate(async _ => {
    const elements = document.querySelectorAll("div[data-testid='wcl-statistics']");
    const result = [];
  
    elements.forEach(element => {
      const category = element.querySelector("div[data-testid='wcl-statistics-category']");
      const homeValue = element.querySelector("div[data-testid='wcl-statistics-value']._homeValue_v26p1_10");
      const awayValue = element.querySelector("div[data-testid='wcl-statistics-value']._awayValue_v26p1_14");
  
      const homeChart = element.querySelector("div[data-testid='wcl-statistics-chart-home']");
      const awayChart = element.querySelector("div[data-testid='wcl-statistics-chart-away']");
  
      if (category && homeValue && awayValue && homeChart && awayChart) {
        result.push({
          category: category.textContent,
          homeValue: homeValue.textContent,
          awayValue: awayValue.textContent,
          homeChartWidth: homeChart.style.width,
          awayChartWidth: awayChart.style.width,
        });
      }
    });
  
    return result;
  });
  await page.close();
  return data;
}

export const getPointByPoint = async (browser, matchId) => {
  const page = await browser.newPage();
  const prefix = "g_3_";
  const startIndex = matchId.indexOf(prefix) + prefix.length;
  const match = matchId.substring(startIndex);
  const url = `${BASE_URL}/match/${match}/#/match-summary/point-by-point/0`;
  await page.goto(url);
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Use page.evaluate to interact with the page and extract data.
   const matchHistoryRows = await page.evaluate(() => {
    const rows = document.querySelectorAll('.matchHistoryRow');
    const matchHistory = [];

    rows.forEach((row) => {
      const homeScore = row.querySelector('.matchHistoryRow__scoreBox .matchHistoryRow__bold').textContent.trim();
      const awayScore = row.querySelector('.matchHistoryRow__scoreBox .matchHistoryRow__score').textContent.trim();

      matchHistory.push({ homeScore, awayScore });
    });

    return matchHistory;
  });
  return matchHistoryRows;
};


export const writeMatchData = (data, pathW, name) => {
  const jsonData = JSON.stringify(data, null, 2);
  const filePath = path.join(pathW, `${name}.json`);

  fs.mkdir(path.dirname(filePath), { recursive: true }, (err) => {
    if (err) {
      console.error("Error creating directories:", err);
    } else {
      fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
          console.error("Error writing to JSON file:", err);
        }
      });
    }
  });
}
