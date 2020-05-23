const { existsSync } = require('fs')
const { sep, normalize, join } = require('path')

module.exports = function () {
  let dir = process.cwd()

  while (dir.length && dir[dir.length - 1] !== sep) {
    if ((existsSync(join(dir, 'quasar.conf.js')) || existsSync(join(dir, 'quasar.conf.cjs'))) {
      const { fatal } = require('./logger')
      fatal(`⚠️  Error. This command must NOT be executed inside a Quasar project folder.`)
    }

    dir = normalize(join(dir, '..'))
  }
}
