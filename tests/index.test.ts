import type { SpawndChildProcess } from 'spawnd';
import puppeteer, { type SupportedBrowser, Browser, Page } from 'puppeteer';
import devServer from 'jest-dev-server';

import { findFreePort, sleep } from './utils';

jest.setTimeout(30000);

describe('buddy', () => {
  let server: SpawndChildProcess[], browser: Browser, page: Page;

  const getResult = async (name: string) => {
    await page.waitForSelector(name);
    const elmt = await page.$(name);
    const result = await elmt.getProperty('textContent');

    return result.jsonValue();
  };

  beforeAll(async () => {
    const port = await findFreePort();
    process.env.TEST_PORT = '' + port;

    server = await devServer.setup({
      command: `NODE_ENV=tests; TEST_PORT=${port}; `+
        `yarn serve`,
      host: 'localhost',
      port,
      protocol: 'http',
      debug: true,
      launchTimeout: 30000,
    });

    await sleep(1000);

    browser = await puppeteer.launch({
      browser: process.env.BROWSER as SupportedBrowser || 'chrome',
      headless: true,
      dumpio: true,
    });
    page = await browser.newPage();
    await page.goto('http://localhost:' + port);
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

  it('should not serialize unknown structures', async () => {
    expect(await getResult('#serialize-unknown'))
      .toBe('[object Object]');
  });

  it('should allow to serialize custom structures', async () => {
    expect(await getResult('#serialize-custom'))
      .toBe('bigint');
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

  it('should be able to handle nested responses from child possibly ' +
    'containing arrays/objects/methods/promises', async () => {
    expect(await getResult('#nested-array-response-from-child'))
      .toBe('response from child');
  });

  it('should not alter primitive types', async () => {
    expect(await getResult('#primitive-type-boolean'))
      .toBe('true');
    expect(await getResult('#primitive-type-int'))
      .toBe('1');
    expect(await getResult('#primitive-type-string'))
      .toBe('"foo"');
    expect(await getResult('#primitive-type-array'))
      .toBe('["foo","bar"]');
  });

  it('should correctly un/serialize back-and-forth messaging ' +
    'data', async () => {
    expect(await getResult('#back-and-forth'))
      .toBe('true');
  });

  it('should correctly handle thrown promises', async () => {
    expect(await getResult('#throw'))
      .toBe('custom_error');
  });

  it('should correctly handle thrown nested promises', async () => {
    expect(await getResult('#throw-deep'))
      .toBe('custom_deep_error');
  });

  it('should correctly handle thrown custom error objects', async () => {
    expect(await getResult('#throw-custom-error'))
      .toBe('custom_error_object');
  });

  it('should correctly handle delayed handlers', async () => {
    expect(await getResult('#delayed'))
      .toBe('response:delayed');
  });

  it('should allow to use websockets', async () => {
    expect(await getResult('#ws')).toBe('test:ws');
  });

  afterAll(async () => {
    await devServer.teardown(server);
    await browser.close();
  });
});
