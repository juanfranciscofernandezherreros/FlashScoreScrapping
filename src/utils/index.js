import fs from "fs";
import path from "path";

import { BASE_URL } from "../constants/index.js";
import { match } from "assert";

export const getMatchIdList = async (browser, country, league) => {
  const page = await browser.newPage();
  const url = `${BASE_URL}/basketball/${country}/${league}/results/`;
  await page.goto(url);
  console.log(url);  
  while (true) {
    try {
      await page.evaluate(async (_) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const element = document.querySelector('a.event__more.event__more--static');
        element.scrollIntoView();
        element.click();
      });
    } catch (error) {
      break;
    }
  }

  const eventDataList = await page.evaluate((_) => {
    return Array.from(document.querySelectorAll('.event__match.event__match--static.event__match--twoLine')).map(
      (element) => {
        const matchId = element?.id?.replace('g_1_', '');
        const eventTime = element.querySelector('.event__time').textContent.trim();
        const homeTeamElement = element.querySelector('.event__participant.event__participant--away');
        const awayTeamElement = element.querySelector('.event__participant.event__participant--home');
        const homeScoreElement = element.querySelector('.event__score.event__score--home');
        const awayScoreElement = element.querySelector('.event__score.event__score--away');
        const homeScore1Element = element.querySelector('.event__part.event__part--home.event__part--1');
        const homeScore2Element = element.querySelector('.event__part.event__part--home.event__part--2');
        const homeScore3Element = element.querySelector('.event__part.event__part--home.event__part--3');
        const homeScore4Element = element.querySelector('.event__part.event__part--home.event__part--4');
        const homeScore5Element = element.querySelector('.event__part.event__part--home.event__part--5');
        const awayScore1Element = element.querySelector('.event__part.event__part--away.event__part--1');
        const awayScore2Element = element.querySelector('.event__part.event__part--away.event__part--2');
        const awayScore3Element = element.querySelector('.event__part.event__part--away.event__part--3');
        const awayScore4Element = element.querySelector('.event__part.event__part--away.event__part--4');
        const awayScore5Element = element.querySelector('.event__part.event__part--away.event__part--5');
  
        const homeTeam = homeTeamElement ? homeTeamElement.textContent.trim() : null;
        const awayTeam = awayTeamElement ? awayTeamElement.textContent.trim() : null;
        const homeScore = homeScoreElement ? homeScoreElement.textContent.trim() : null;
        const awayScore = awayScoreElement ? awayScoreElement.textContent.trim() : null;
        const homeScore1 = homeScore1Element ? homeScore1Element.textContent.trim() : null;
        const homeScore2 = homeScore2Element ? homeScore2Element.textContent.trim() : null;
        const homeScore3 = homeScore3Element ? homeScore3Element.textContent.trim() : null;
        const homeScore4 = homeScore4Element ? homeScore4Element.textContent.trim() : null;
        const homeScore5 = homeScore5Element ? homeScore5Element.textContent.trim() : null;
        const awayScore1 = awayScore1Element ? awayScore1Element.textContent.trim() : null;
        const awayScore2 = awayScore2Element ? awayScore2Element.textContent.trim() : null;
        const awayScore3 = awayScore3Element ? awayScore3Element.textContent.trim() : null;
        const awayScore4 = awayScore4Element ? awayScore4Element.textContent.trim() : null;
        const awayScore5 = awayScore5Element ? awayScore5Element.textContent.trim() : null;
  
        return { matchId, eventTime, homeTeam, awayTeam, homeScore, awayScore, homeScore1, homeScore2, homeScore3, homeScore4, homeScore5, awayScore1, awayScore2, awayScore3, awayScore4, awayScore5 };
      }
    );
  });
  


  await page.close();
  return { eventDataList };
};


export const getFixtures = async (browser, country, league) => {
  const page = await browser.newPage();
  const url = `${BASE_URL}/basketball/${country}/${league}/fixtures/`;
  await page.goto(url);  
  while (true) {
    try {
      await page.evaluate(async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const element = document.querySelector('a.event__more.event__more--static');
        element.scrollIntoView();
        element.click();
      });
    } catch (error) {
      break;
    }
  }

  const matchIdList = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".event__match--static"))
      .map(element => element?.id?.replace("g_1_", ""));
  });

  // Use Puppeteer to extract the event__time values
  const eventTimes = await page.evaluate(() => {
    const eventTimeElements = Array.from(document.querySelectorAll('.event__time'));
    return eventTimeElements.map(element => element.textContent);
  });

  // Use Puppeteer to extract the event__time values
  const eventHome = await page.evaluate(() => {
    const eventTimeElements = Array.from(document.querySelectorAll('.event__participant--home'));
    return eventTimeElements.map(element => element.textContent);
  });

  // Use Puppeteer to extract the event__time values
  const eventAway = await page.evaluate(() => {
    const eventTimeElements = Array.from(document.querySelectorAll('.event__participant--away'));
    return eventTimeElements.map(element => element.textContent);
  });

  await page.close();

  // Combina todas las listas en un solo array
  const combinedData = [];
  for (let i = 0; i < matchIdList.length; i++) {
    combinedData.push({
      matchId: matchIdList[i],
      eventTime: eventTimes[i],
      homeTeam: eventHome[i],
      awayTeam: eventAway[i],
    });
  }
  return combinedData;
};

export const getMatchData = async (browser, matchId) => {
  const page = await browser.newPage();  
  const url = `${BASE_URL}/match/${matchId}/#/match-summary/match-summary`;
  console.log(url);
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
  console.log(url);
  await page.goto(url);

  // Esperar a que los elementos estén disponibles
  await page.waitForSelector('div._category_rbkfg_5, div._value_1efsh_5._homeValue_1efsh_10, div._value_1efsh_5._awayValue_1efsh_14');

  // Obtener todos los elementos que coinciden con los selectores
  const categoryElements = await page.$$('div._category_rbkfg_5');
  const homeValueElements = await page.$$('div._value_1efsh_5._homeValue_1efsh_10');
  const awayValueElements = await page.$$('div._value_1efsh_5._awayValue_1efsh_14');

  // Extraer datos de los elementos
  const categories = await Promise.all(categoryElements.map(async (element) => {
    const text = await element.evaluate(node => node.innerText);
    return text;
  }));

  const homeValues = await Promise.all(homeValueElements.map(async (element) => {
    const text = await element.evaluate(node => node.innerText);
    return text;
  }));

  const awayValues = await Promise.all(awayValueElements.map(async (element) => {
    const text = await element.evaluate(node => node.innerText);
    return text;
  }));

  // Cerrar la página después de obtener los datos
  await page.close();

  // Combina la información en un objeto antes de devolverlo
  const data = categories.map((category, index) => ({
    category,
    homeValue: homeValues[index],
    awayValue: awayValues[index],
  }));

  return data;
};

export const getDateMatch = async (browser, matchId) => {
  const match = matchId.split('_')[2];
  const page = await browser.newPage();
  const url = `${BASE_URL}/match/${match}/#/match-summary`;
  console.log(url);
  await page.goto(url);
  
  // Espera a que los elementos estén presentes en el DOM y sean visibles
  await page.waitForSelector('.duelParticipant__startTime');
  await page.waitForSelector('.duelParticipant__home .participant__participantName a');

  const data = await page.evaluate(() => {
    const rows = document.querySelectorAll('.duelParticipant__startTime');
    const dates = [];

    rows.forEach(row => {
      const dateText = row.textContent.trim();
      dates.push(dateText);
    });

    const teamInfo = document.querySelector('.duelParticipant__home');
    const teamLinkLocal = teamInfo.querySelector('.participant__participantName a').getAttribute('href');
    const teamNameLocal = teamInfo.querySelector('.participant__participantName a').innerText.trim();

    const teamAway = document.querySelector('.duelParticipant__away');
    const teamLinkAway = teamAway.querySelector('.participant__participantName a').getAttribute('href');
    const teamNameAway = teamAway.querySelector('.participant__participantName a').innerText.trim();

    return { dates, teamNameLocal, teamLinkLocal, teamNameAway, teamLinkAway };
});

const matchHistoryRows = data.dates;
const teamNameLocal = data.teamNameLocal;
const teamLinkLocal = data.teamLinkLocal;
const teamNameAway = data.teamNameAway;
const teamLinkAway = data.teamLinkAway;


  return { matchHistoryRows, teamNameLocal, teamNameAway,teamLinkLocal,teamLinkAway };
};




export const getPointByPoint = async (browser, matchId,playerIndex) => {
  const page = await browser.newPage();
  const prefix = "g_3_";
  const startIndex = matchId.indexOf(prefix) + prefix.length;
  const match = matchId.substring(startIndex);
  const url = `${BASE_URL}/match/${match}/#/match-summary/point-by-point/${playerIndex}`;
  console.log(url);
  await page.goto(url);
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Use page.evaluate to interact with the page and extract data.
   const matchHistoryRows = await page.evaluate(() => {
    const rows = document.querySelectorAll('.matchHistoryRow');
    const matchHistory = [];

    rows.forEach((row) => {
      const score = row.querySelector('.matchHistoryRow__scoreBox').textContent.trim();
      matchHistory.push({ score });
    });

    return matchHistory;
  });
  return matchHistoryRows;
};


