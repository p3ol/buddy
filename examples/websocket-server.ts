import { createServer } from 'node:http';

import { WebSocketServer } from 'ws';

import { on } from '../src';

const server = createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('okay');
});

const wss = new WebSocketServer({ server });
const port = Number(process.env.WS_PORT || 64001);

wss.on('connection', ws => {
  on('test:ws', () => 'test:ws', {
    source: ws, target: ws,
  });
});

server.listen(port, 'localhost', () => {
  // eslint-disable-next-line no-console
  console.log('Websocket server running at ws://localhost:' + port);
});
