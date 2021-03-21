import Vue from 'vue'

import { isSSR, client } from './Platform.js'
import { listenOpts, noop, prevent, stopAndPrevent } from '../utils/event.js'
import { getTouchTarget } from '../utils/touch.js'

const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/
const isChinese = /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u{2f800}-\u{2fa1f}]/u
const isKorean = /[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/

const props = [
  'isKeyboard',
  'isComposing',

  'isPointer',
  'isMouse',
  'isTouch',
  'isDrag',

  'isContext',

  'isPending',

  'event'
]

function getObject () {
  return props.reduce((acc, type) => {
    acc[type] = type === 'event' ? null : false
    return acc
  }, {})
}

const config = getObject()
config.isComposing = void 0

const eventsTouch = [
  ['touchstart', { ...config, isTouch: true, isPointer: true, isPending: true }, true],
  ['touchend', { ...config, isTouch: true, isPointer: true, isPending: false }],
  ['touchcancel', { ...config, isTouch: true, isPointer: true, isPending: false }]
]

const eventsCleanClick = ['mousestart', 'touchstart', 'dragstart']

const eventsTouchEnd = eventsTouch.slice(1)

const { passiveCapture, notPassiveCapture } = listenOpts

const preventClickCleanupHandlers = []

function clickCleanup () {
  const { documentElement } = document
  const fns = preventClickCleanupHandlers.slice()

  preventClickCleanupHandlers.length = 0

  fns.forEach(fn => {
    documentElement.removeEventListener('click', fn, notPassiveCapture)
  })
}

const Interaction = {
  install ($q, queues) {
    if (isSSR === true) {
      queues.server.push((q) => {
        q.interaction = getObject()
        q.interaction.preventClick = noop
      })
      return
    }

    Object.assign(this, getObject())

    const self = this

    props.forEach(prop => {
      Vue.util.defineReactive(self, prop, self[prop])
    })
    Vue.util.defineReactive($q, 'interaction', this)

    const fnFactory = (eventType, props, touchLocal) => {
      const setStateFns = Object.keys(props)
        .filter(key => props[key] !== void 0)
        .map(key => {
          const value = props[key]

          if (typeof value === 'function') {
            return event => {
              self[key] = value(event)
            }
          }

          return () => {
            self[key] = value
          }
        })

      const touchLocalFn = typeof touchLocal === 'function'
        ? touchLocal
        : (
          touchLocal === true
            ? event => {
              const target = getTouchTarget(event.target)

              eventsTouchEnd.forEach(setConfig => {
                const fn = fnFactory(setConfig[0], setConfig[1], () => {
                  eventsTouchEnd.forEach(clearConfig => {
                    target.removeEventListener(clearConfig[0], fn, passiveCapture)
                  })
                })
                target.addEventListener(config[0], fn, passiveCapture)
              })
            }
            : noop
        )

      const clickCleanupFn = eventsCleanClick.includes(eventType) === true
        ? clickCleanup
        : noop

      return event => {
        setStateFns.forEach(fn => {
          fn(event)
        })

        self.event = event

        touchLocalFn(event)

        clickCleanupFn()
      }
    }

    const { documentElement } = document
    const events = [
      ['keydown', { ...config, isKeyboard: true, isPending: true }],
      ['keypress', { ...config, isKeyboard: true, isPending: true }],
      ['keyup', { ...config, isKeyboard: true, isPending: false }],

      client.is.ios === true
        ? ['compositionstart', {
          isComposing: ev => {
            ev.target.composing = true
            return true
          }
        }]
        : ['compositionupdate', {
          isComposing: ev => {
            if (
              ev.target.composing !== true &&
              typeof ev.data === 'string' && (
                isJapanese.test(ev.data) === true ||
                isChinese.test(ev.data) === true ||
                isKorean.test(ev.data) === true
              )
            ) {
              ev.target.composing = true
            }
            return true
          }
        }],
      ['compositionend', {
        isComposing: ev => {
          if (ev.target.composing === true) {
            ev.target.composing = false
          }
          return false
        }
      }],

      ['mousedown', { ...config, isMouse: true, isPointer: true, isPending: true }],
      ['mouseup', { ...config, isMouse: true, isPointer: true, isPending: false }],

      ['dragstart', { isKeyboard: false, isDrag: true, isPending: true }],
      ['dragend', { isKeyboard: false, isDrag: true, isPending: false }],
      ['dragcancel', { isKeyboard: false, isDrag: true, isPending: false }],
      ['drop', { isKeyboard: false, isDrag: true, isPending: false }],

      ['contextmenu', { isContext: true, isPending: false }]
    ]

    events.forEach(config => {
      documentElement.addEventListener(config[0], fnFactory.apply(this, config), passiveCapture)
    })

    if (client.has.touch === true) {
      eventsTouch.forEach(config => {
        documentElement.addEventListener(config[0], fnFactory.apply(this, config), passiveCapture)
      })
    }
  },

  preventClick (target, stop) {
    const { documentElement } = document
    const fn = evt => {
      if (target === evt.target) {
        if (stop === true) {
          stopAndPrevent(evt)
        }
        else {
          prevent(evt)
        }
      }
      clickCleanup()
    }

    documentElement.addEventListener('click', fn, notPassiveCapture)

    preventClickCleanupHandlers.push(fn)
  }
}

export default Interaction
