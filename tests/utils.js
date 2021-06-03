import net from 'net';

export const sleep = time =>
  new Promise(resolve => setTimeout(resolve, time));

export const findFreePort = async () => {
  let port;
  let i = 10000;

  while (!port && i < 65535) {
    await new Promise(resolve => {
      const c = net.createConnection({ port: i, host: 'localhost' });
      c.on('connect', () => {
        c.destroy();
        c.unref();
        resolve();
      });
      c.on('error', () => {
        port = i;
        c.destroy();
        c.unref();
        resolve();
      });
    });
    i++;
  }

  return port;
};
