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
  console.log(url)

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

  console.log(data)
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
  console.log(url)
  await new Promise(resolve => setTimeout(resolve, 1500));
  const data = await page.evaluate(async _ => {
    const elements = Array.from(document.querySelectorAll("div.playerStatsTable__cell"));
    const result = {};
    elements.forEach((element, index) => {
      result[`element_${index}`] = element.outerText;
    });
    return result;
  });
  await page.close();
  return data;
}

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
