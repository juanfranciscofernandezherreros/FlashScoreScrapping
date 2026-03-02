import * as cheerio from "cheerio";
import fs from "fs";
import { BASE_URL } from "./constants/index.js";

/**
 * Parses FlashScore HTML content and extracts league and match data.
 * Node.js adaptation of the Python BeautifulSoup extraer_flashscore() function.
 *
 * @param {string} htmlContent - Raw HTML string from a FlashScore page.
 * @returns {Array<Object>} Array of match objects with league/match details.
 */
export function extraerFlashscore(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const resultados = [];

  let paisActual = "";
  let ligaActual = "";
  let linkLigaActual = "";

  const elementos = $("div.headerLeague__wrapper, div.event__match");

  elementos.each((_i, el) => {
    const $el = $(el);
    const classes = $el.attr("class") || "";

    // League header
    if (classes.includes("headerLeague__wrapper")) {
      const paisEl = $el.find("span.headerLeague__category-text");
      const ligaEl = $el.find("a.headerLeague__title");

      if (paisEl.length && ligaEl.length) {
        paisActual = paisEl.text().trim().replace(":", "");
        ligaActual = ligaEl.text().trim();
        linkLigaActual = BASE_URL + (ligaEl.attr("href") || "");
      }
    }
    // Match event
    else if (classes.includes("event__match")) {
      const linkMatchEl = $el.find("a.eventRowLink");
      const linkMatch = linkMatchEl.length
        ? BASE_URL + (linkMatchEl.attr("href") || "")
        : "";

      const home = $el.find("div.event__participant--home").text().trim();
      const away = $el.find("div.event__participant--away").text().trim();

      const sHome = $el.find("span.event__score--home");
      const sAway = $el.find("span.event__score--away");
      const marcador =
        sHome.length && sAway.length
          ? `${sHome.text().trim()}-${sAway.text().trim()}`
          : "VS";

      const estadoEl = $el.find("div.event__stage");
      const estado = estadoEl.length ? estadoEl.text().trim() : "Finalizado";

      resultados.push({
        País: paisActual,
        Liga: ligaActual,
        "Link Liga": linkLigaActual,
        Partido: `${home} vs ${away}`,
        Resultado: marcador,
        Estado: estado,
        "Link Partido": linkMatch,
      });
    }
  });

  return resultados;
}

/**
 * Converts an array of match objects to CSV string.
 *
 * @param {Array<Object>} data - Array of match objects from extraerFlashscore().
 * @returns {string} CSV formatted string.
 */
export function toCSV(data) {
  if (!data || data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);
  const headerRow = headers.join(",");
  const rows = data.map((obj) =>
    headers
      .map((key) => {
        const value = String(obj[key] ?? "")
          .replace(/"/g, '""')
          .replace(/\r?\n/g, " ");
        return `"${value}"`;
      })
      .join(",")
  );

  return headerRow + "\n" + rows.join("\n");
}

/**
 * Parses HTML and writes extracted data to a CSV file.
 *
 * @param {string} htmlContent - Raw HTML string from a FlashScore page.
 * @param {string} outputPath - Path for the output CSV file.
 */
export function extraerFlashscoreToCSV(htmlContent, outputPath) {
  const data = extraerFlashscore(htmlContent);
  const csv = toCSV(data);

  if (!csv) {
    console.log("No data extracted from the provided HTML.");
    return;
  }

  fs.writeFileSync(outputPath, csv, "utf8");
  console.log(`Data exported to ${outputPath} (${data.length} matches)`);
}

// CLI usage: node src/htmlParser.js <input.html> [output.csv]
const isMainModule =
  process.argv[1] &&
  (process.argv[1].endsWith("htmlParser.js") ||
    process.argv[1].endsWith("htmlParser"));

if (isMainModule && process.argv.length >= 3) {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3] || "flashscore_output.csv";

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const htmlContent = fs.readFileSync(inputFile, "utf8");
  extraerFlashscoreToCSV(htmlContent, outputFile);
}
