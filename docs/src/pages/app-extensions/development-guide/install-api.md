---
title: App Extension Install API
desc: The API for the install script of a Quasar App Extension. Initializes the app space by rendering or changing files and more.
---

This page refers to `src/install.js` file which is executed on the installation of the App Extension only. Not all App Extensions will need an install -- this is an optional step.

Example of basic structure of the file:

```js
module.exports = function (api) {
  // props and methods for "api" Object
  // are described below
}
```

## api.extId
Contains the `ext-id` (String) of this App Extension.

## api.prompts
Is an Object which has the answers to the prompts when this App Extension gets installed. For more info on prompts, check out [Prompts API](/app-extensions/development-guide/prompts-api).

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
if (api.hasPackage('quasar', '^1.0.0')) {
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

## api.extendPackageJson
Helper method to extend package.json with new props. If specifying existing props, **it will override** them.

```js
/**
 * @param {object|string} extPkg - Object to extend with or relative path to a JSON file
 */
api.extendPackageJson({
  scripts: {
    'electron': 'quasar dev -m electron'
  }
})
```

The above example adds an npm script to the app's package.json, so you can then execute `yarn electron` (or the equivalent `npm run electron`).

## api.extendJsonFile
Extend a JSON file with new props (deep merge). If specifying existing props, it will override them.

```js
/**
 * @param {string} file (relative path to app root folder)
 * @param {object} newData (Object to merge in)
 */
api.extendJsonFile('src/some.json', {
  newProp: 'some-value'
})
```

## api.render
Renders (copies) a folder from your App Extension templates (any folder you specify) into root of the app. Maintains the same folder structure that the template folder has.

If some of the files already exist in the app then it will ask the user if they should be overwritten or not.

Needs a relative path to the folder of the file calling render().

```js
/**
 * Render a folder from extension templates into devland
 * Needs a path (to a folder) relative to the path of the file where render() is called
 *
 * @param {string} templatePath (relative path to folder to render in app)
 * @param {object} scope (optional; rendering scope variables)
 * @param {object} options (optional; { templateCompiler: 'lodash' | 'handlebars' }
 */
api.render('./path/to/a/template/folder')
```

### Filename edge cases
If you want to render a template file that either begins with a dot (i.e. .env) you will have to follow a specific naming convention, since dotfiles are ignored when publishing your plugin to npm:

```bash
# templates containing dotfiles must use an
# underscore instead of the dot in their names:

some-folder/_env

# When calling api.render('./some-folder'), this will be
# rendered in the project folder as:

/.env
```

If you want to render a file whose name actually begins with an underscore, then the filename must begin with `__` (two underscore characters instead of only one):

```bash
some-folder/__my.css

# When calling api.render('./template'), this will be
# rendered in the project folder as:

/_my.css
```

### Using scope
You can also inject some decision-making code into the files to be rendered by interpolating with [lodash.template](https://www.npmjs.com/package/lodash.template) syntax.

Example:

```js
// src/install.js
// (my-folder is located in same folder as
// the file in which following call takes place)
api.render('./my-folder', {
  prompts: api.prompts
})
```

Let's imagine we use a [Prompts API](/app-extensions/development-guide/prompts-api) file too. It asks the user if he/she wants "Feature X" and stores the answer in a variable called "featureX".

We can take some decisions on what the files that we render look like, during rendering them. This removes the need of creating two folders and deciding which to render, based on some decision.

```js
// src/my-folder/some-file.js

<% if (prompts.featureX) { %>
const message = 'This is content when "Feature X" exists'
<% } else { %>
const message = 'This is content when we don\'t have "Feature X"'
<% } %>
```

Possibilities are limited only by your imagination.

### Using Handlebars as template compiler <q-badge align="top" label="@quasar/app v3+" />

If `templateCompiler` in `options` is set to `handlebars`, the source files will be rendered with the [Handlebars](https://handlebarsjs.com/) templating engine instead of lodash. Any .hbs extensions will also be stripped automatically.
## api.renderFile <q-badge align="top" label="@quasar/app v2+" />

Similar with api.render() with the difference that this method renders a single file.

```js
/**
 * Render a file from extension template into devland
 * Needs a path (to a file) relative to the path of the file where renderFile() is called
 *
 * @param {string} relativeSourcePath (file path relative to the folder from which the install script is called)
 * @param {string} relativeTargetPath (file path relative to the root of the app -- including filename!)
 * @param {object} scope (optional; rendering scope variables)
 * @param {object} options (optional; { templateCompiler: 'lodash' | 'handlebars' }
 */
api.renderFile('./path/to/a/template/filename', 'path/relative/to/app/root/filename', {
  prompts: api.prompts
})

api.renderFile('./my-file.json', 'src/my-file.json')
```

## api.getPersistentConf

Get the internal persistent config of this extension. Returns empty object if it has none.

```js
/**
 * @return {object} cfg
 */
api.getPersistentConf()
```

## api.setPersistentConf

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

Deep merge into the internal persistent config of this extension. If extension does not have any config already set, this is essentially equivalent to setting it for the first time.

```js
/**
 * @param {object} cfg
 */
api.mergePersistentConf({
  // ....
})
```

## api.onExitLog
Adds a message to be printed after App CLI finishes up installing the App Extension and is about to exit. Can be called multiple times to register multiple exit logs.

```js
/**
 * @param {string} msg
 */
api.onExitLog('Thanks for installing my awesome extension')
```
