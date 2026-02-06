![CI](https://github.com/p3ol/buddy/workflows/CI/badge.svg)

# 🐕 Buddy

> Dead simple cross-domain iframe messaging


## Installation

```bash
yarn add @poool/buddy
```


## Usage with iFrames/windows

On the child frame:
```ts
import { on, send } from '@poool/buddy';

// Register handler inside child window
on('getInfos', async event => {
  console.log('You have a message from some window :', event.data);

  // You can even pass methods to child window and retrieve its return value
  // using promises or async/await:'
  console.log(await event.data.someMethod());

  // You can even send data back to parent, EVEN METHODS \o/
  // Parent will only have to await `send()` method promise to get the result
  return { someOtherMethod: () => 30 };
}, { source: someParentWindow });
```

On the parent frame:
```ts
// And send some message from parent window
send(someChildWindow, 'getInfos', { infos: 'some string', someMethod: () => 25 }, { origin: '*' });
```

Buddy serializes all the primitive types (using `JSON.parse`) and even __methods__ or __promises__, using custom back & forth `Promise` logic.

## Usage with WebSockets

Buddy can also be used with WebSockets, by using the `WebSocket` object as __both target and source__:

On the server:
```ts
import { createServer } from 'node:http';

import { on } from '@poool/buddy';
import { WebSocketServer } from 'ws';

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  on('getInfos', async event => {
    console.log('You have a message from some browser:', event.data);

    return { someOtherMethod: () => 30 };
  }, { source: ws, target: ws });
});

server.listen(8080);
```

On the client:
```ts
import { send } from '@poool/buddy';

const ws = new WebSocket('ws://localhost:8080');
ws.addEventListener('open', () => {
  send(ws, 'getInfos', { infos: 'some string', someMethod: () => 25 }, {
    source: ws, target: ws,
  });
});
```

## Clean-up

All the handlers registered with `on()` can be turned off by calling their off-switch `off()` method:

```ts
const { off } = on('someEvent', () => { /* ... */ }, { ... });
// And then later
off();
```

Because of the way Buddy recursively serializes methods & promises (e.g using nested `on()`s & `send()`s), you can also call the `off()` method on every off-switch created by serialization resulting from initial calls to the `on()` or `send()` methods:

```ts
const switches: BuddyOffSwitch[] = [];
const { off } = on('someEvent', () => { /* ... */ }, { offSwitches: switches });
send(someWindow, 'someOtherEvent', { someMethod: () => 25 }, { offSwitches: switches });
// And then later
switches.forEach(s => s.off());
```


## Configuration

Global options can be updated using `setGlobalOptions` method:

```javascript
import { setGlobalOptions } from '@poool/buddy';

setGlobalOptions({ logLevel: 0 });
```

### Options

#### timeout
- Type: `Number`
- Default: `5000`

Message expiration time, after which an error will be thrown.

#### logLevel
- Type: `Number`
- Default: `1`

Either `0` (disabled), `1` (error), `2` (warn), `3` (info), `4` (debug), `5` (log)

#### queue
- Type: `Boolean`
- Default: `false`

If `true`, messages will be queued until the target window is ready to receive them.
Needs to also be set inside the target window to trigger a ready event.

#### serializers
- Type: `Array<BuddySerializer>`
- Default: `[]`

Custom serializers to use to serialize/unserialize data.
See [serializers](#serializers) section for more details.

## Documentation

### on(name, callback, options)

* `name` {`String`} Event name
* `callback` {`Function`}
  * `event` {`Object`}
* `options` {`Object`}
  * `source` {`Window` | `WebSocket`} Source window or websocket connection
  * `origin` {`String`} Origin expected from source. `*` (default) or any other origin.
  * `offSwitches` {`Array<BuddyOffSwitch>`} Optional array that will hold off-switches references. See [clean-up](#clean-up) section for more details.
  * `...globalOptions`

### send(target, name, data, options)

* `target` {`Window` | `WebSocket`} Target window or websocket connection
* `name` {`String`} Event name
* `data` {`Object`} Data to be serialized & sent to child
* `options` {`Object`}
  * `origin` {`String`} Origin expected from source. `*` (default) or any other origin.
  * `pingBack` {`Boolean`} Mostly used internally. Whether sender should await a response from receiver or not. `true` (default) or `false`
  * `offSwitches` {`Array<BuddyOffSwitch>`} Optional array that will hold off-switches references. See [clean-up](#clean-up) section for more details.
  * `...globalOptions`

## Custom serializers

Buddy uses `JSON.stringify` to send pre-serialized data to `.postMessage` (and `JSON.parse` to deserialize), allowing to automatically serialize primitive data like numbers or strings, and uses
internal serializers to pre-serialize more complex data like `Date`, `Error` or even `Function` and `Promise` objects.

Although it cannot cover all the possible use cases, you can add your own serializers to handle custom data types.
A serializer is a simple object with four methods: `serializable`, `serialize`, `unserializable` and `unserialize`.

```javascript
// Creating a custom serializer for Map objects
const mapSerializer = {
  serializable: data => data instanceof Map,
  serialize: data => ({ type: 'map', entries: Array.from(data.entries()) }),
  unserializable: data => data.type === 'map' && data.entries,
  unserialize: data => new Map(data.entries),
};
```

⚠️ A custom serializer's `serializable`/`unserializable` methods returning true for any data will override all the other serializers, even internal ones, so be careful to only match the data you specifically want to serialize.

## Contributing

[![](https://contrib.rocks/image?repo=p3ol/buddy)](https://github.com/p3ol/buddy/graphs/contributors)

Please check the [CONTRIBUTING.md](https://github.com/p3ol/buddy/blob/master/CONTRIBUTING.md) doc for contribution guidelines.

## Development

Install dependencies:

```bash
yarn install
```

Run examples at http://localhost:64000/ with webpack dev server:

```bash
yarn serve
```

And test your code:

```bash
yarn test
```

## License

This software is licensed under [MIT](https://github.com/p3ol/buddy/blob/master/LICENSE).
