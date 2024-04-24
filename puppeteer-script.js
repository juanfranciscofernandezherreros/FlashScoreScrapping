import puppeteer from "puppeteer"
import { getUrls } from "src/urls";
const browser = await puppeteer.launch({
    //headless: "new", // Opting into the new headless mode instead of true
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();

try {
    // Navigate to the page
    await page.goto('https://www.flashscore.com/basketball/', { waitUntil: 'load', timeout: 60000 }); // 60 seconds timeout
    // Take a screenshot
    getUrls('https://www.flashscore.com/basketball/');
    console.log('Puppeteer script executed successfully.');
} catch (error) {
    console.error('Error running Puppeteer script:', error);
} finally {
    // Close the browser
    await browser.close();
}