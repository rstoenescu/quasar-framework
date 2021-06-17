import { version } from '../package.json'
import Platform, { isSSR } from './plugins/Platform.js'
import Interaction from './plugins/Interaction.js'
import Screen from './plugins/Screen.js'
import Dark from './plugins/Dark.js'
import History from './history.js'
import Lang from './lang.js'
import Body from './body.js'
import IconSet from './icon-set.js'

const autoInstalled = [
  Platform, Screen, Dark, Interaction
]

export const queues = {
  server: [], // on SSR update
  takeover: [] // on client takeover
}

export const $q = {
  version,
  config: {}
}

export default function (Vue, opts = {}) {
  if (this.__qInstalled === true) { return }
  this.__qInstalled = true

  const cfg = $q.config = Object.freeze(opts.config || {})

  // required plugins
  Platform.install($q, queues)
  Body.install(queues, cfg)
  Dark.install($q, queues, cfg)
  Interaction.install($q, queues)
  Screen.install($q, queues, cfg)
  History.install(cfg)
  Lang.install($q, queues, opts.lang)
  IconSet.install($q, queues, opts.iconSet)

  if (isSSR === true) {
    Vue.mixin({
      beforeCreate () {
        this.$q = this.$root.$options.$q
      }
    })
  }
  else {
    Vue.prototype.$q = $q
  }

  opts.components && Object.keys(opts.components).forEach(key => {
    const c = opts.components[key]
    if (typeof c === 'function') {
      Vue.component(c.options.name, c)
    }
  })

  opts.directives && Object.keys(opts.directives).forEach(key => {
    const d = opts.directives[key]
    if (d.name !== undefined && d.unbind !== void 0) {
      Vue.directive(d.name, d)
    }
  })

  if (opts.plugins) {
    const param = { $q, queues, cfg }
    Object.keys(opts.plugins).forEach(key => {
      const p = opts.plugins[key]
      if (typeof p.install === 'function' && autoInstalled.includes(p) === false) {
        p.install(param)
      }
    })
  }
}
