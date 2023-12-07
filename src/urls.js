import puppeteer from 'puppeteer';

async function main(url) {
  if (!url) {
    console.log("No se proporcionó ninguna URL.");
    return;
  }

  console.log(`La URL proporcionada es ${url}.`);

  const basketballHrefs = await extractBasketballHrefs(url);
  
  // Print all extracted basketball hrefs
  for (const href of basketballHrefs) {
    console.log(`Enlace extraído que cumple con los criterios: ${href}`);
  }
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

// Check if a URL argument is provided
const urlArgIndex = process.argv.indexOf('--url');
const urlToScrape = urlArgIndex !== -1 ? process.argv[urlArgIndex + 1] : null;

if (!urlToScrape) {
  console.error('Error: No URL provided. Please use --url argument.');
} else {
  getUrls(urlToScrape);
}

async function getUrls(url) {
  await main(url);
}
