const parseArgs = require('minimist')
const inversify = require('inversify')
require('reflect-metadata')
/**
 * Create the shared container
 * @type {Container}
 */
const CONTAINER = new inversify.Container()
const TOP_COMMANDS = require('./constants/commands')
/**
 * Runner should load all available dependencies into each of the top level commands
 * this will look something like future=@quasar/cli-build that maps to
 * current=./bin/quasar-build.
 *
 * The main CLI script *quasar* injects a Runner with basic options and uses
 * the default init bootstrapping. This should automatically load all installed
 * dependencies into it's own container
 */
class Runner {
  /**
   * Runner takes a runner configuration instance
   * @param {RunnerConfig}
   */
  constructor ({ init = true, auto = false, sliceAt = 2, min = false, exit = true }) {
    this.shouldExit = exit
    /**
     * Inversify Container for loading Command's Dependencies
     * @type {inversify.Container}
     */
    this.container = CONTAINER
    /**
     * The command arguments array for this runner
     * @type {Array.<*>}
     */
    this.cmd = process.argv.slice(sliceAt)

    // Sanity check from configuration
    // if (!(this.cmd in allowed)) this.fail('Command is not allowed')
    // this.allowed = allowed

    // Bootstrap the instance
    if (init) this.init()
    if (min) this.argv = parseArgs(this.cmd, min)
    if (auto) this.start()
  }

  /**
   * Sanity check for available command and
   * bootstrap any installed local-consumer
   */
  init () {
    // TODO: Iron out this abstraction in vanilla js
    // https://github.com/inversify/inversify-vanillajs-helpers
    if (this.cmd in TOP_COMMANDS) {
      // this.container
    }
  }

  /**
   * Bind a package name to a Class
   * @param pkgName
   * @param Class
   */
  bind (pkgName, Class) {
    console.log(this)
    typeof this.container !== 'undefined'
      ? this.container.bind(pkgName).to(Class)
      : CONTAINER.bind(pkgName).to(Class)
  }

  /**
   * Rebind a package name to a class
   * @param pkgName
   * @param Class
   */
  rebind (pkgName, Class) {
    this.container.rebind(pkgName).to(Class)
  }

  /**
   * Find a package in your system
   * @param pkg
   */
  fetch (pkg) {
    // return this.container.get(pkg)
  }

  /**
   * Start Running
   */
  start () {
    console.log('Running a default task! You probably want to override this method!')
    this.stop()
  }

  /**
   * Stop running with an optional error
   * @param err
   */
  stop (err) {
    console.log('Stopping the program')
    if (this.shouldExit) process.exit(err)
  }

  /**
   * Display Failed Message and Stop
   */
  fail (err, throwable = false) {
    console.log('Failed')
    if (throwable) throw new Error(err)
    this.stop(err)
  }

  /**
   * Display Help Contents
   */
  help () {
    console.log('Help Docs')
  }
}

inversify.decorate(inversify.injectable(), Runner)

module.exports = Runner
