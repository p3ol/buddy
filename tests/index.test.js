describe('Module', () => {
  it('should generate a `buddy` global', () => {
    expect(window.buddy).not.toBe(undefined);
  });
});

describe('Messaging', () => {
  let contentWindow;

  beforeAll((done) => {
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

    expect(result).toBe('response:messaging');
  });

  it('should return a timeout error', async () => {
    let error;

    console.log('launching tests')
    try {
      await window.buddy
        .send(contentWindow, 'test:wrongWindow', '', { origin: '*' });
    } catch (e) {
      error = e;
      console.error(error);
    }

    expect(error).not.toBe(undefined);
    expect(error.name).toBe('timeout');
  });
});
