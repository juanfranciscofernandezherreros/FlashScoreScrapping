import { BASE_URL } from "../constants/index.js";

export const getMatchIdList = async (browser, country, league) => {
  const page = await browser.newPage();
  const url = `${BASE_URL}/basketball/${country}/${league}/results/`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  // 1. Aceptar cookies
  const cookieButtonSelector = 'button#onetrust-accept-btn-handler';
  try {
    await page.waitForSelector(cookieButtonSelector, { timeout: 3000 });
    await page.click(cookieButtonSelector);
    console.log("[INFO] Cookies aceptadas");
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch {
    console.log("[INFO] No se mostró el banner de cookies");
  }

  // 2. Hacer clic repetidamente en "Show more matches"
  const showMoreSelector = 'a[data-testid="wcl-buttonLink"] span';

  let keepClicking = true;
  let clickCount = 0;

  while (keepClicking) {
    try {
      const isVisible = await page.$eval(showMoreSelector, el =>
        el.offsetParent !== null && el.textContent.includes("Show more matches")
      ).catch(() => false);

      if (!isVisible) {
        keepClicking = false;
        console.log("[INFO] No hay más partidos que mostrar");
        break;
      }

      await page.click(showMoreSelector);
      clickCount++;
      console.log(`[INFO] Click número ${clickCount} en "Show more matches"`);

      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.warn("[WARN] Error al hacer clic en 'Show more matches':", error.message);
      break;
    }
  }

  // 3. Scroll automático
  try {
    await autoScroll(page);
  } catch (error) {
    console.error("Error while scrolling:", error);
  }

  // 4. Extraer datos
  const eventDataList = await extractEventData(page);
  await page.close();
  return { eventDataList };
};

export async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}


async function extractEventData(page) {
  return await page.evaluate(() => {
    const eventDataList = [];
    const eventElements = document.querySelectorAll(
      '.event__match.event__match--static.event__match--twoLine, .event__match.event__match--withRowLink.event__match--twoLine'
    );
    eventElements.forEach((element) => {
        const matchId = element?.id ? element.id.replace(/^g_\d+_/, '') : null;
        const eventTime = element.querySelector('.event__time').textContent.trim();
        const homeTeam = element.querySelector('.event__participant.event__participant--home')?.textContent.trim() || null;
        const awayTeam = element.querySelector('.event__participant.event__participant--away')?.textContent.trim() || null;
        const homeScore = element.querySelector('.event__score.event__score--home')?.textContent.trim() || null;
        const awayScore = element.querySelector('.event__score.event__score--away')?.textContent.trim() || null;        
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
      eventDataList.push({ matchId, eventTime, homeTeam, awayTeam, homeScore, awayScore,homeScore1 , homeScore2 , homeScore3 , homeScore4 , homeScore5 ,awayScore1,awayScore2,awayScore3,awayScore4,awayScore5 });
    });

    return eventDataList;
  });
}


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
  const url = `${BASE_URL}/match/${matchId}/#/match-summary/player-statistics/0`;
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
      // Create an object with all the player statistics
      const playerStatsObject = {};

      // Iterate through all the statistics and add them to the object
      statHeaders.forEach((header, index) => {
        playerStatsObject[header] = playerStats[index];
      });
      playerData.push({
        name: playerName,
        stats: playerStatsObject,
      });
    });
    return playerData; // Return the playerData object
  });
  return playerData;
};

export const getStatsMatch = async (browser, matchId, playerIndex) => {
  const page = await browser.newPage();    
  const url = `${BASE_URL}/match/${matchId}/#/match-summary/match-statistics/${playerIndex}`;
  
  console.log(`➡️ Abriendo página de estadísticas de partido: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    console.log(`✅ Página cargada correctamente para matchId=${matchId}, playerIndex=${playerIndex}`);

    await page.waitForSelector('.wcl-homeValue_-iJBW strong[data-testid="wcl-scores-simpleText-01"]', { timeout: 8000 });
    await page.waitForSelector('.wcl-awayValue_rQvxs strong[data-testid="wcl-scores-simpleText-01"]', { timeout: 8000 });
    await page.waitForSelector('.wcl-category_7qsgP strong[data-testid="wcl-scores-simpleText-01"]', { timeout: 8000 });
    console.log(`✅ Selectores encontrados correctamente para matchId=${matchId}, playerIndex=${playerIndex}`);

    const matchData = await page.evaluate(() => {
      const homeRows = document.querySelectorAll('.wcl-homeValue_-iJBW strong[data-testid="wcl-scores-simpleText-01"]');
      const awayRows = document.querySelectorAll('.wcl-awayValue_rQvxs strong[data-testid="wcl-scores-simpleText-01"]');
      const categoryElements = document.querySelectorAll('.wcl-category_7qsgP strong[data-testid="wcl-scores-simpleText-01"]');

      const csvRows = [];

      homeRows.forEach((homeRow, index) => {
        const homeScore = homeRow?.textContent?.trim() ?? '';
        const awayScore = awayRows[index]?.textContent?.trim() ?? '';
        const category = categoryElements[index]?.textContent?.trim() ?? '';
        const csvRow = `${homeScore},${category},${awayScore}`;
        csvRows.push(csvRow);
      });

      return csvRows.join('\n');
    });

    console.log(`✅ Datos de estadísticas del partido extraídos correctamente para matchId=${matchId}, playerIndex=${playerIndex}`);
    return matchData;

  } catch (error) {
    console.error(`❌ Error al procesar las estadísticas del partido matchId=${matchId}, playerIndex=${playerIndex}: ${error.message}`);
    return '';
  } finally {
    await page.close();
    console.log(`📄 Página cerrada para matchId=${matchId}, playerIndex=${playerIndex}`);
  }
};

export const getDateMatch = async (browser, matchId) => {
  const match = matchId.split('_')[2];
  const page = await browser.newPage();
  const url = `${BASE_URL}/match/${match}/#/match-summary`;
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
  const url = `${BASE_URL}/match/${matchId}/#/match-summary/point-by-point/${playerIndex}`;
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


