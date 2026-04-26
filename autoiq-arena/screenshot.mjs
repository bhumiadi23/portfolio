import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  // Dashboard
  await page.goto('http://localhost:5173/');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/dashboard.png' });

  // Compare
  await page.goto('http://localhost:5173/compare');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/performance.png' });

  // Database
  await page.goto('http://localhost:5173/cars');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/database.png' });

  await browser.close();
})();
