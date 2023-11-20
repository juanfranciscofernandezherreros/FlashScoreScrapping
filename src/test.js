// index.js

import { getUrls } from '../script';

async function runScript() {
  try {
    const browser = await puppeteer.launch();
    await getUrls(browser);
    await browser.close();
  } catch (error) {
    console.error('Error running script:', error);
  }
}

runScript();
