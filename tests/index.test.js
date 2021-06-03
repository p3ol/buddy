import puppeteer from 'puppeteer';
import istanbul from 'puppeteer-to-istanbul';
import devServer from 'jest-dev-server';

describe('buddy', () => {
  let browser, page;

  const getResult = async name => {
    await page.waitForSelector(name);
    const elmt = await page.$(name);
    const result = await elmt.getProperty('textContent');

    return result.jsonValue();
  };

  beforeAll(async () => {
    jest.setTimeout(30000);
    await devServer.setup({
      command: 'NODE_ENV=tests; BABEL_ENV=tests yarn serve',
      port: 64000,
      launchTimeout: 30000,
    });

    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.coverage.startJSCoverage();
    await page.goto('http://localhost:64000');
  });

  it('should send data to an iframe and get a response', async () => {
    expect(await getResult('#messaging')).toBe('response:messaging');
  });

  it('should throw a `source` error if target window doesn\'t expect sender ' +
    'to send the message', async () => {
    expect(await getResult('#wrong-window')).toBe('source');
  });

  it('should serialize an array', async () => {
    expect(await getResult('#serialize-array')).toBe('[0,1]');
  });

  it('should serialize a method passed inside data sent to child', async () => {
    expect(await getResult('#serialize-method')).toBe('true');
  });

  it('should serialize a promise passed inside data sent to ' +
    'child', async () => {
    expect(await getResult('#serialize-promise')).toBe('promise result');
  });

  it('should unserialize functions & objects', async () => {
    expect(await getResult('#unserialize-functions-objects'))
      .toBe(JSON.stringify({
        unserializedFunction: 1,
        unserializedObject: { test: true },
      }));
  });

  it('should allow child to get callback return value', async () => {
    expect(await getResult('#parent-method-return-value'))
      .toBe('result from parent');
  });

  it('should throw a `timeout` error when no handler has been found in ' +
    'child', async () => {
    expect(await getResult('#this-does-not-exist-in-child')).toBe('timeout');
  });

  it('should allow to call a serialized function more than once', async () => {
    expect(await getResult('#parent-method-called-twice')).toBe('true');
  });

  it('should not send data to an iframe if target isnt set', async () => {
    expect(await getResult('#no-target')).toBe('false');
  });

  afterAll(async () => {
    const coverage = await page.coverage.stopJSCoverage();
    istanbul.write([...coverage]);

    await devServer.teardown();
    await browser.close();
  });
});
