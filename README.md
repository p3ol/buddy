# 🐕 Buddy

> Dead simple cross-domain iframe messaging


## Installation

```bash
yarn add @poool/buddy
```


## Usage

```javascript
import { on, send } from '@poool/buddy';

// Register handler inside child window
on('getInfos', async event => {
  console.log('You have a message from some window :', event.data);

  // You can even pass methods to child window and retrieve its return value
  // using promises or async/await:'
  console.log(await event.data.someMethod());
}, { source: someParentWindow });

// And send some message from parent window
send(someChildWindow, 'getInfos', { infos: 'some string', someMethod: () => 25 }, { origin: '*' });
```

Buddy serializes all the primitive types (using `JSON.parse`) and even __methods__, using custom back & forth `Promise` logic.


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


## Documentation

### on(name, callback, options)

* `name` {`String`} Event name
* `callback` {`Function`}
  * `event` {`Object`}
* `options` {`Object`}
  * `source` {`Window`} Source window
  * `origin` {`String`} Origin expected from source window. `*` (default) or any other origin.
  * `...globalOptions`

### send(target, name, data, options)

* `target` {`Window`} Target window
* `name` {`String`} Event name
* `data` {`Object`} Data to be serialized & sent to child
* `options` {`Object`}
  * `origin` {`String`} Origin expected from source window. `*` (default) or any other origin.
  * `pingBack` {`Boolean`} Mostly used internally. Whether sender should await a response from receiver or not. `true` (default) or `false`
  * `...globalOptions`


## Contributing

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

## Contributors

<!-- Contributors START
Ugo_Stephant dackmin https://ugostephant.io code doc tools
Contributors END -->
<!-- Contributors table START -->
| <img src="https://avatars.githubusercontent.com/dackmin?s=100" width="100" alt="Ugo Stephant" /><br />[<sub>Ugo Stephant</sub>](https://github.com/dackmin)<br />[💻](https://github.com/p3ol/junipero/commits?author=dackmin) [📖](https://github.com/p3ol/buddy/commits?author=dackmin) 🔧 |
| :---: |
<!-- Contributors table END -->
