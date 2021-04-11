const fs = require('fs')
const fse = require('fs-extra')

const appPaths = require('../app-paths')
const { log, warn } = require('../helpers/logger')

class Mode {
  get isInstalled () {
    return fs.existsSync(appPaths.ssrDir)
  }

  get isTypeScript () {
    const tsConfig = appPaths.resolve.app('tsconfig.json')
    return fs.existsSync(tsConfig)
  }

  add () {
    if (this.isInstalled) {
      warn(`SSR support detected already. Aborting.`)
      return
    }

    log(`Creating SSR source folder...`)
    const format = 'default' // this.isTypeScript ? 'ts' : 'default'
    fse.copySync(appPaths.resolve.cli(`templates/ssr/${format}`), appPaths.ssrDir)
    log(`SSR support was added`)
  }

  remove () {
    if (!this.isInstalled) {
      warn(`No SSR support detected. Aborting.`)
      return
    }

    log(`Removing SSR source folder`)
    fse.removeSync(appPaths.ssrDir)
    log(`SSR support was removed`)
  }
}

module.exports = Mode
