import puppeteer from 'puppeteer';
import devServer from 'jest-dev-server';

describe('buddy', () => {
  let browser, page;

  beforeAll(async () => {
    jest.setTimeout(30000);
    await devServer.setup({
      command: 'yarn serve',
      port: 64000,
      launchTimeout: 30000,
    });

    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.coverage.startJSCoverage();
    await page.goto('http://localhost:64000');
  });

  it('should achieve basic messaging', async () => {
    await page.waitForSelector('#messaging');
    const elmt = await page.$('#messaging');
    const result = await elmt.getProperty('textContent');
    expect(await result.jsonValue()).toBe('response:messaging');
  });

  it('should throw a `source` error if target window doesn\'t expect sender ' +
    'to send the message', async () => {
    await page.waitForSelector('#wrong-window');
    const elmt = await page.$('#wrong-window');
    const result = await elmt.getProperty('textContent');
    expect(await result.jsonValue()).toBe('source');
  });

  afterAll(async () => {
    await page.coverage.stopJSCoverage();

    await devServer.teardown();
    await browser.close();
  });
});
