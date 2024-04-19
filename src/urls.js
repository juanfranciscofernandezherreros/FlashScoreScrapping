import puppeteer from 'puppeteer';
import { generateCSVDataList } from "./csvGenerator.js";
import {formatFecha } from "./fecha.js";

async function main(url) {
  if (!url) {
    console.log("No se proporcionó ninguna URL.");
    return;
  }

  console.log(`La URL proporcionada es ${url}.`);

  const basketballHrefs = await extractBasketballHrefs(url);
  for (const href of basketballHrefs) {
    console.log(` ${href}`);
  }

  const fechaActual = new Date();
  const formattedFecha = formatFecha(fechaActual);
  const nombreArchivo = `src/csv/URLS_${formattedFecha}`;
  generateCSVDataList(basketballHrefs, nombreArchivo);
  return basketballHrefs; 
}

async function extractBasketballHrefs(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url);
    const allHrefs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.map(link => link.href);
    });

    // Filter URLs that start with "https://www.flashscore.com/basketball/" and do not contain "#"
    const basketballHrefs = allHrefs.filter(href => (
      href.startsWith("https://www.flashscore.com/basketball/") && !/#/.test(href)
    ));

    return basketballHrefs;
  } finally {
    await browser.close();
  }
}

// Verificar si se proporciona un argumento de URL
const urlArgIndex = process.argv.indexOf('--url');
const urlToScrape = urlArgIndex !== -1 ? process.argv[urlArgIndex + 1] : null;

if (!urlToScrape) {
  console.error('Error: No se proporcionó ninguna URL. Por favor, use el argumento --url.');
} else {
  const basketballUrls = await main(urlToScrape); // Obtener las URLs utilizando la función main
  console.log("Basketball URLs:", basketballUrls); // Imprimir la lista de URLs
}
