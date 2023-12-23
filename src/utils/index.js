import fs from "fs";
import path from "path";

import { BASE_URL } from "../constants/index.js";
import { match } from "assert";

export const getMatchIdList = async (browser, country, league) => {
  const page = await browser.newPage();
  const url = `${BASE_URL}/basketball/${country}/${league}/results/`;
  await page.goto(url);

   // Extrayendo el contenido específico por su clase
   const additionalContent = await page.$eval('.heading__info', element => {
    return element ? element.textContent.trim() : null;
  });

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
 return { matchIdList, additionalContent };}

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
  const match = matchId.split('_')[2]
  const page = await browser.newPage();
  const url = `${BASE_URL}/match/${match}/#/match-summary`;
  console.log(url);
  await page.goto(url);
  await new Promise(resolve => setTimeout(resolve, 1500));  

  const matchHistoryRows = await page.evaluate(() => {
    const rows = document.querySelectorAll('.duelParticipant__startTime');
    const dates = [];

    rows.forEach(row => {
      const dateText = row.textContent.trim();
      dates.push(dateText);
    });

    return dates;
  });
  return matchHistoryRows;
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


