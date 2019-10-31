import { expect } from 'chai';
import sinon from 'sinon/pkg/sinon.js';

describe('Messaging', () => {
  let contentWindow;

  before((done) => {
    window.buddy.setGlobalOptions({ logLevel: 5 });

    const frame = document.createElement('iframe');
    frame.src = '/base/tests/child.html';
    frame.id = 'child';
    frame.onload = () => {
      contentWindow = frame.contentWindow;
      done();
    };
    document.body.appendChild(frame);
  });

  it('should send data to an iframe and get a response', async () => {
    const result = await window.buddy
      .send(contentWindow, 'test:messaging', '', { origin: '*' });

    expect(result).to.equal('response:messaging');
  });

  it('should throw a `source` error if target window doesn\'t expect sender ' +
    'to send the message', async () => {
    let error;

    try {
      await window.buddy
        .send(contentWindow, 'test:wrongWindow', '', { origin: '*' });
    } catch (e) {
      error = e;
    }

    expect(error).to.not.be.undefined;
    expect(error.message).to.equal('source');
  });

  it('should serialize a method passed inside data sent to child', async () => {
    const callback = sinon.spy();

    await window.buddy.send(contentWindow, 'test:serializeMethod',
      { callback }, { origin: '*' });

    expect(callback.called).to.equal(true);
  });

  it('should allow child to get callback return value', async () => {
    const callback = sinon.spy(() => 'result from parent');

    const result = await window.buddy.send(contentWindow,
      'test:parentMethodReturnValue', { callback }, { origin: '*' });

    expect(callback.called).to.equal(true);
    expect(result).to.equal('result from parent');
  });

  it('should throw a `timeout` error when no handler has been found in ' +
    'child', async () => {
    let error;

    try {
      await window.buddy.send(contentWindow,
        'test:thisDoesNotExistInChild', null, { origin: '*', timeout: 100 });
    } catch (e) {
      error = e;
    }

    expect(error).to.not.be.undefined;
    expect(error.message).to.equal('timeout');
  });

});
