const
  path = require('path'),
  semver = require('semver'),
  merge = require('webpack-merge')

const
  appPaths = require('../app-paths'),
  logger = require('../helpers/logger'),
  warn = logger('app:extension(index)', 'red'),
  getPackageJson = require('../helpers/get-package-json'),
  getCallerPath = require('../helpers/get-caller-path'),
  extensionJson = require('./extension-json')

/**
 * API for extension's /index.js script
 */
module.exports = class IndexAPI {
  constructor ({ extId, prompts, ctx }) {
    this.ctx = ctx
    this.extId = extId
    this.prompts = prompts
    this.resolve = appPaths.resolve
    this.appDir = appPaths.appDir

    this.__hooks = {
      extendQuasarConf: [],
      extendWebpack: [],
      chainWebpackMainElectronProcess: [],
      extendWebpackMainElectronProcess: [],
      chainWebpack: [],
      beforeDev: [],
      afterDev: [],
      beforeBuild: [],
      afterBuild: [],
      onPublish: [],
      commands: {},
      describeApi: {},
      extendSsr: []
    }
  }

  /**
   * Get the internal persistent config of this extension.
   * Returns empty object if it has none.
   *
   * @return {object} cfg
   */
  getPersistentConf () {
    return extensionJson.getInternal(this.extId)
  }

  /**
   * Set the internal persistent config of this extension.
   * If it already exists, it is overwritten.
   *
   * @param {object} cfg
   */
  setPersistentConf (cfg) {
    extensionJson.setInternal(this.extId, cfg || {})
  }

  /**
   * Deep merge into the internal persistent config of this extension.
   * If extension does not have any config already set, this is
   * essentially equivalent to setting it for the first time.
   *
   * @param {object} cfg
   */
  mergePersistentConf (cfg = {}) {
    const currentCfg = this.getPersistentConf()
    this.setPersistentConf(merge(currentCfg, cfg))
  }

  /**
   * Ensure the App Extension is compatible with
   * host app package through a
   * semver condition.
   *
   * If the semver condition is not met, then
   * @quasar/app errors out and halts execution
   *
   * Example of semver condition:
   *   '1.x || >=2.5.0 || 5.0.0 - 7.2.3'
   *
   * @param {string} packageName
   * @param {string} semverCondition
   */
  compatibleWith (packageName, semverCondition) {
    const json = getPackageJson(packageName)

    if (json === void 0) {
      warn(`⚠️  Extension(${this.extId}): Dependency not found - ${packageName}. Please install it.`)
      process.exit(1)
    }

    if (!semver.satisfies(json.version, semverCondition)) {
      warn(`⚠️  Extension(${this.extId}): is not compatible with ${packageName} v${json.version}. Required version: ${semverCondition}`)
      process.exit(1)
    }
  }

  /**
   * Check if a host app package is installed. Can also
   * check its version against specific semver condition.
   *
   * Example of semver condition:
   *   '1.x || >=2.5.0 || 5.0.0 - 7.2.3'
   *
   * @param {string} packageName
   * @param {string} (optional) semverCondition
   * @return {boolean} package is installed and meets optional semver condition
   */
  hasPackage (packageName, semverCondition) {
    const json = getPackageJson(packageName)

    if (json === void 0) {
      return false
    }

    return semverCondition !== void 0
      ? semver.satisfies(json.version, semverCondition)
      : true
  }

  /**
   * Check if another app extension is installed
   * (app extension npm package is installed and it was invoked)
   *
   * @param {string} extId
   * @return {boolean} has the extension installed & invoked
   */
  hasExtension (extId) {
    return extensionJson.has(extId)
  }

  /**
   * Get the version of a host app package.
   *
   * @param {string} packageName
   * @return {string|undefined} version of app's package
   */
  getPackageVersion (packageName) {
    const json = getPackageJson(packageName)
    return json !== void 0
      ? json.version
      : void 0
  }

  /**
   * Extend quasar.conf
   *
   * @param {function} fn
   *   (cfg: Object, ctx: Object) => undefined
   */
  extendQuasarConf (fn) {
    this.__addHook('extendQuasarConf', fn)
  }

  /**
   * Chain webpack config
   *
   * @param {function} fn
   *   (cfg: ChainObject, invoke: Object {isClient, isServer}) => undefined
   */
  chainWebpack (fn) {
    this.__addHook('chainWebpack', fn)
  }

  /**
   * Extend webpack config
   *
   * @param {function} fn
   *   (cfg: Object, invoke: Object {isClient, isServer}) => undefined
   */
  extendWebpack (fn) {
    this.__addHook('extendWebpack', fn)
  }

  /**
   * Chain webpack config of main electron process
   *
   * @param {function} fn
   *   (cfg: ChainObject) => undefined
   */
  chainWebpackMainElectronProcess (fn) {
    this.__addHook('chainWebpackMainElectronProcess', fn)
  }

  /**
   * Extend webpack config of main electron process
   *
   * @param {function} fn
   *   (cfg: Object) => undefined
   */
  extendWebpackMainElectronProcess (fn) {
    this.__addHook('extendWebpackMainElectronProcess', fn)
  }

  /**
   * Register a command that will become available as
   * `quasar run <ext-id> <cmd> [args]` and `quasar <ext-id> <cmd> [args]`
   *
   * @param {string} commandName
   * @param {function} fn
   *   ({ args: [ string, ... ], params: {object} }) => ?Promise
   */
  registerCommand (commandName, fn) {
    this.__hooks.commands[commandName] = fn
  }

  /**
   * Register an API file for "quasar describe" command
   *
   * @param {string} name
   * @param {string} relativePath
   *   (relative path to Api file)
   */
  registerDescribeApi (name, relativePath) {
    const dir = getCallerPath()
    this.__hooks.describeApi[name] = path.resolve(dir, relativePath)
  }

  /**
   * Prepare external services before dev command runs.
   *
   * @param {function} fn
   *   (api, { quasarConf }) => ?Promise
   */
  beforeDev (fn) {
    this.__addHook('beforeDev', fn)
  }

  /**
   * Run hook after Quasar dev server is started ($ quasar dev).
   * At this point, the dev server has been started and is available
   * should you wish to do something with it.
   *
   * @param {function} fn
   *   (api, { quasarConf }) => ?Promise
   */
  afterDev(fn) {
    this.__addHook('afterDev', fn)
  }

  /**
   * Run hook before Quasar builds app for production ($ quasar build).
   * At this point, the distributables folder hasn't been created yet.
   *
   * @param {function} fn
   *   (api, { quasarConf }) => ?Promise
   */
  beforeBuild (fn) {
    this.__addHook('beforeBuild', fn)
  }

  /**
   * Run hook after Quasar built app for production ($ quasar build).
   * At this point, the distributables folder has been created and is available
   * should you wish to do something with it.
   *
   * @param {function} fn
   *   (api, { quasarConf }) => ?Promise
   */
  afterBuild (fn) {
    this.__addHook('afterBuild', fn)
  }

  /**
   * Run hook if publishing was requested ("$ quasar build -P"),
   * after Quasar built app for production and the afterBuild
   * hook (if specified) was executed.
   *
   * @param {function} fn
   *   ({ arg, ...}) => ?Promise
   *      * arg - argument supplied to "--publish"/"-P" parameter
   *      * quasarConf - quasar.conf config object
   *      * distDir - folder where distributables were built
   */
  onPublish (fn) {
    this.__addHook('onPublish', fn)
  }

  /**
   * Run hook before Quasar starts the SSR server.
   *
   * @param {function} fn
   *   (api, { app }) => ?Promise
   */
  extendSsr(fn) {
    this.__addHook('extendSsr', fn)
  }

  /**
   * Private methods
   */

  __getHooks () {
    return this.__hooks
  }

  __addHook (name, fn) {
    this.__hooks[name].push({ fn, api: this })
  }
}
