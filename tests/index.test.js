import 'core-js';

import { setGlobalOptions, send } from '../src';
import { expect } from 'chai';
import sinon from 'fixed-sinon';

describe('Messaging', () => {
  let contentWindow;

  before(done => {
    setGlobalOptions({ logLevel: 5 });

    const frame = document.createElement('iframe');
    frame.src = '/base/tests/child.html';
    frame.id = 'child';
    frame.onload = () => {
      contentWindow = frame.contentWindow;
      done();
    };
    document.body.appendChild(frame);
  });

  it('should set global options', () => {
    setGlobalOptions({ logLevel: 0 });
    expect(true).to.equal(true);
  });

  it('should send data to an iframe and get a response', async () => {
    const result = await send(contentWindow,
      'test:messaging', '', { origin: '*' });

    expect(result).to.equal('response:messaging');
  });

  it('should throw a `source` error if target window doesn\'t expect sender ' +
    'to send the message', async () => {
    let error;

    try {
      await send(contentWindow, 'test:wrongWindow', '', { origin: '*' });
    } catch (e) {
      error = e;
    }

    expect(error).to.not.be.undefined;
    expect(error.message).to.equal('source');
  });

  it('should serialize a method passed inside data sent to child', async () => {
    const callback = sinon.spy();

    await send(contentWindow,
      'test:serializeMethod', { callback }, { origin: '*' });

    expect(callback.called).to.equal(true);
  });

  it('should serialize a promise passed inside data sent to ' +
    'child', async () => {
    const callback = Promise.resolve('promise result');

    const result = await send(contentWindow,
      'test:serializePromise', callback, { origin: '*' });

    expect(result.bid).to.not.be.undefined;
    expect(result.type).to.equal('promise');
  });

  it('should allow child to get callback return value', async () => {
    const callback = sinon.spy(() => 'result from parent');

    const result = await send(contentWindow,
      'test:parentMethodReturnValue', { callback }, { origin: '*' });

    expect(callback.called).to.equal(true);
    expect(result).to.equal('result from parent');
  });

  it('should throw a `timeout` error when no handler has been found in ' +
    'child', async () => {
    let error;

    try {
      await send(contentWindow,
        'test:thisDoesNotExistInChild', null, { origin: '*', timeout: 100 });
    } catch (e) {
      error = e;
    }

    expect(error).to.not.be.undefined;
    expect(error.message).to.equal('timeout');
  });

  it('should allow to call a serialized function more than once', async () => {
    const callback = sinon.spy();
    await send(contentWindow,
      'test:parentMethodCalledTwice', { callback }, { origin: '*' });

    expect(callback.calledTwice).to.equal(true);
  });

});
