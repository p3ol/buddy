import net from 'node:net';

export const sleep = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time));

export const findFreePort = async () =>
  new Promise<number>((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, () => {
      const port = (server.address() as net.AddressInfo).port;

      server.close(() => {
        server.unref();
        resolve(port);
      });
    });
  });
