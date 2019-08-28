---
title: App Extension Index API
desc: The API for the index script of a Quasar App Extension. Provides access to Quasar context, registers new CLI commands, extends Webpack config and more. 
---

This page refers to `src/index.js` file, which is executed on `quasar dev` and `quasar build`. This is the main process where you can modify the build to suit the needs of your App Extension. For instance, registering a boot file, modifying the webpack process, registering CSS, registering a UI component, registering a Quasar CLI command, etc.

Example of basic structure of the file:

```js
module.exports = function (api) {
  // props & methods for "api" Object described below
}
```

## api.ctx
Same as the `ctx` from `/quasar.conf.js`. Helps you make decisions based on the context in which `quasar dev` or `quasar build` runs.

Example: You might want to use one of the api methods if running for electron mode only.

```js
if (api.ctx.dev === true && api.ctx.mode === 'electron') {
  api.beforeDev((api) => {
    // do something when running quasar dev and
    // with Electron mode
  })
}
```

## api.extId
Contains the `ext-id` (String) of this App Extension.

## api.prompts
Is an Object which has the answers to the prompts when this App Extension got installed. For more info on prompts, check out [Prompts API](/app-extensions/development-guide/prompts-api).

## api.resolve
Resolves paths within the app on which this App Extension is running. Eliminates the need to import `path` and resolve the paths yourself.

```js
// resolves to root of app
api.resolve.app('src/my-file.js')

// resolves to root/src of app
api.resolve.src('my-file.js')

// resolves to root/src-pwa of app
api.resolve.pwa('some-file.js')

// resolves to root/src-ssr of app
api.resolve.ssr('some-file.js')

// resolves to root/src-cordova of app
api.resolve.cordova('config.xml')

// resolves to root/src-electron of app
api.resolve.electron('some-file.js')
```

## api.appDir
Contains the full path (String) to the root of the app on which this App Extension is running.

## api.compatibleWith

<q-badge label="@quasar/app v1.0.0-beta.18+" />

Ensure the App Extension is compatible with a package installed in the host app through a semver condition.

If the semver condition is not met, then @quasar/app errors out and halts execution.

Example of semver condition: `'1.x || >=2.5.0 || 5.0.0 - 7.2.3'`.

```js
/**
 * @param {string} packageName
 * @param {string} semverCondition
 */
api.compatibleWith('@quasar/app', '1.x')
```

## api.hasPackage

<q-badge label="@quasar/app v1.0.0-beta.18+" />

Determine if some package is installed in the host app through a semver condition.

Example of semver condition: `'1.x || >=2.5.0 || 5.0.0 - 7.2.3'`.

```js
/**
 * @param {string} packageName
 * @param {string} (optional) semverCondition
 * @return {boolean} package is installed and meets optional semver condition
 */
if (api.hasPackage('vuelidate')) {
  // hey, this app has it (any version of it)
}
if (api.hasPackage('quasar', '^1.0.0-beta.0')) {
  // hey, this app has v1 installed
}
```

## api.hasExtension
Check if another app extension is npm installed and Quasar CLI has invoked it.

```js
/**
 * Check if another app extension is installed
 *
 * @param {string} extId
 * @return {boolean} has the extension installed & invoked
 */
if (api.hasExtension(extId)) {
  // hey, we have it
}
```

## api.getPackageVersion

<q-badge label="@quasar/app v1.0.0-beta.18+" />

Get the version of a host app package.

```js
/**
 * @param {string} packageName
 * @return {string|undefined} version of app's package
 */
console.log( api.getPackageVersion(packageName) )
// output examples:
//   1.1.3
//   undefined (when package not found)
```

## api.extendQuasarConf
Extends quasar.conf.js

```js
/**
 * @param {function} fn
 *   (cfg: Object, ctx: Object) => undefined
 */
api.extendQuasarConf ((conf, api) => {
  // do something with quasar.conf.js:
  // add, change anything
})
```

### Registering boot and css files

```js
module.exports = function (api, ctx) {
  api.extendQuasarConf((conf, api) => {
    // make sure my-ext boot file is registered
    conf.boot.push('~quasar-app-extension-my-ext/src/boot/my-ext-bootfile.js')

    // make sure boot file transpiles
    conf.build.transpileDependencies.push(/quasar-app-extension-my-ext[\\/]src[\\/]boot/)
    // if boot file imports anything, make sure that
    // the regex above matches those files too!

    // make sure my-ext css goes through webpack
    conf.css.push('~quasar-app-extension-my-ext/src/component/my-ext.styl')
  })
}
```

::: tip
Notice the tidle (`~`) in front of the paths. This tells Quasar CLI that the path is a dependency from node_modules instead of a relative path to App Extension index script file.
:::

## api.chainWebpack
Chain webpack config

```js
/**
 * @param {function} fn
 *   (cfg: ChainObject, invoke: Object {isClient, isServer}) => undefined
 */
api.chainWebpack((cfg, { isClient, isServer }, api) => {
  // add/remove/change cfg (Webpack chain Object)
})
```

## api.extendWebpack
Extend webpack config

```js
/**
 * @param {function} fn
 *   (cfg: Object, invoke: Object {isClient, isServer}) => undefined
 */
api.extendWebpack((cfg, { isClient, isServer }, api) => {
  // add/remove/change cfg (Webpack configuration Object)
})
```

## api.chainWebpackMainElectronProcess
Chain webpack config of main electron process

```js
/**
 * @param {function} fn
 *   (cfg: ChainObject) => undefined
 */
api.chainWebpackMainElectronProcess((cfg, { isClient, isServer }, api) => {
  // add/remove/change cfg (Webpack chain Object)
})
```

## api.extendWebpackMainElectronProcess
Extend webpack config Object of main electron process

```js
/**
 * @param {function} fn
 *   (cfg: Object) => undefined
 */
api.extendWebpackMainElectronProcess((cfg, { isClient, isServer }, api) => {
  // add/remove/change cfg (Webpack configuration Object)
})
```

## api.registerCommand
Register a command that will become available as `quasar run <ext-id> <cmd> [args]` (or the short form: `quasar <ext-id> <cmd> [args]`).

```js
/**
 * @param {string} commandName
 * @param {function} fn
 *   ({ args: [ string, ... ], params: {object} }) => ?Promise
 */
api.registerCommand('start', ({ args, params }) => {
  // do something here

  // this registers the "start" command
  // and this handler is executed when running
  // $ quasar run <ext-id> start
})
```

## api.registerDescribeApi
Register an API file for `$ quasar describe` command.

```js
/**
 * @param {string} name
 * @param {string} relativePath
 *   (relative path starting from the file where you have this call)
 */
api.registerDescribeApi(
  'MyComponent',
  './relative/path/to/my/component/file.json'
)
```

The above will then respond to `$ quasar describe MyComponent`.

For syntax of such a JSON file, look into `/node_modules/quasar/dist/api` (in your project folder). Be aware that your JSON must contain a `type` property ("component", "directive", "plugin"). For instance:

```json
{
  "type": "component",
  "props": {
  },
  ...
}
```

::: tip
Always test with the `quasar describe` command to ensure you got the syntax right and there are no errors.
:::

## api.getPersistentConf

<q-badge label="@quasar/app v1.0.0-beta.25+" />

Get the internal persistent config of this extension. Returns empty object if it has none.

```js
/**
 * @return {object} cfg
 */
api.getPersistentConf()
```

## api.setPersistentConf

<q-badge label="@quasar/app v1.0.0-beta.25+" />

Set the internal persistent config of this extension. If it already exists, it is overwritten.

```js
/**
 * @param {object} cfg
 */
api.setPersistentConf({
  // ....
})
```

## api.mergePersistentConf

<q-badge label="@quasar/app v1.0.0-beta.25+" />

Deep merge into the internal persistent config of this extension. If extension does not have any config already set, this is essentially equivalent to setting it for the first time.

```js
/**
 * @param {object} cfg
 */
api.mergePersistentConf({
  // ....
})
```

## api.beforeDev

<q-badge label="@quasar/app v1.0.0-beta.18+" />

Prepare external services before `$ quasar dev` command runs, like starting some backend or any other service that the app relies on.

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   (api, { quasarConf }) => ?Promise
 */
api.beforeDev((api, { quasarConf }) => {
  // do something
})
```

## api.afterDev

Run hook after Quasar dev server is started (`$ quasar build`). At this point, the dev server has been started and is available should you wish to do something with it.

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   (api, { quasarConf }) => ?Promise
 */
api.afterDev((api, { quasarConf }) => {
  // do something
})
```

## api.beforeBuild

<q-badge label="@quasar/app v1.0.0-beta.16+" />

Run hook before Quasar builds app for production (`$ quasar build`). At this point, the distributables folder hasn't been created yet.

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   (api, { quasarConf }) => ?Promise
 */
api.beforeBuild((api, { quasarConf }) => {
  // do something
})
```

## api.afterBuild

Run hook after Quasar built app for production (`$ quasar build`). At this point, the distributables folder has been created and is available should you wish to do something with it.

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   (api, { quasarConf }) => ?Promise
 */
api.afterBuild((api, { quasarConf }) => {
  // do something
})
```

## api.onPublish

<q-badge label="@quasar/app v1.0.0-rc.7+" />

Run hook if publishing was requested (`$ quasar build -P`), after Quasar built app for production and the afterBuild hook (if specified) was executed.

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   () => ?Promise
 * @param {object} opts
 *   * arg - argument supplied to "--publish"/"-P" parameter
 *   * distDir - folder where distributables were built
 */
api.onPublish((api, opts) => {
  // do something
})
```

## api.extendSsr

<q-badge label="@quasar/app v1.1.0+" />

Run hook when the SSR express instance is created (`$ quasar dev|build -m ssr`).

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   () => ?Promise
 * @param {object} opts
 *   * app - the underlying Express instance
 */
api.extendSsr((api, opts) => {
  // do something
})
```
